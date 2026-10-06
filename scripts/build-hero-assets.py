import os
import sys
import subprocess
import imageio_ffmpeg
import numpy as np
import cv2
from scipy.io import wavfile

def get_ffmpeg_bin():
    return imageio_ffmpeg.get_ffmpeg_exe()

def build_assets():
    ffmpeg = get_ffmpeg_bin()
    input_video = 'intro.mp4'
    
    os.makedirs('public/hero', exist_ok=True)
    os.makedirs('public', exist_ok=True)

    print("--- 1. Extracting and cross-fading audio with NumPy ---")
    temp_wav_in = 'temp_in.wav'
    cmd_audio_out = [
        ffmpeg, '-y', '-i', input_video,
        '-t', '10.0',
        '-vn', '-acodec', 'pcm_s16le', '-ar', '48000', '-ac', '2',
        temp_wav_in
    ]
    subprocess.run(cmd_audio_out, check=True)

    sample_rate, audio = wavfile.read(temp_wav_in)
    duration_sec = 10.0
    fade_sec = 0.5
    
    total_samples = int(duration_sec * sample_rate)
    fade_samples = int(fade_sec * sample_rate)
    out_samples = total_samples - fade_samples

    if len(audio) < total_samples:
        pad = np.zeros((total_samples - len(audio), audio.shape[1]), dtype=audio.dtype)
        audio = np.vstack([audio, pad])
    else:
        audio = audio[:total_samples]

    audio_float = audio.astype(np.float32)
    out_audio = np.zeros((out_samples, audio.shape[1]), dtype=np.float32)

    out_audio[:out_samples] = audio_float[:out_samples]

    for i in range(fade_samples):
        t = i / float(fade_samples)
        out_audio[i] = audio_float[i] * t + audio_float[out_samples + i] * (1.0 - t)

    out_audio_int16 = np.clip(out_audio, -32768, 32767).astype(np.int16)
    temp_wav_seamless = 'temp_seamless.wav'
    wavfile.write(temp_wav_seamless, sample_rate, out_audio_int16)
    print("Audio crossfade complete.")

    print("--- 2. Processing Video (Crop with Headroom, Whiten Background, Seamless XFade) ---")
    # Add top padding of 75px to guarantee comfortable space above head (Y=22 in original)
    # crop=864:1080:548:0, pad=864:1155:0:75:color=white, scale=768:960
    filter_complex = (
        "[0:v]crop=864:1080:548:0,pad=864:1155:0:75:color=white,scale=768:960,"
        "colorlevels=rimax=0.98:gimax=0.98:bimax=0.98,fps=24[v0];"
        "[v0]split[v1][v2];"
        "[v1]trim=start=0:end=10,setpts=PTS-STARTPTS,fps=24[vmain];"
        "[v2]trim=start=0:end=0.5,setpts=PTS-STARTPTS,fps=24[vloop];"
        "[vmain][vloop]xfade=transition=fade:duration=0.5:offset=9.5[vouts]"
    )

    hero_mp4 = os.path.join('public', 'hero', 'hero.mp4')
    print(f"Exporting {hero_mp4}...")
    cmd_mp4 = [
        ffmpeg, '-y',
        '-i', input_video,
        '-i', temp_wav_seamless,
        '-filter_complex', filter_complex,
        '-map', '[vouts]',
        '-map', '1:a',
        '-c:v', 'libx264', '-crf', '24', '-preset', 'slow', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '96k',
        '-movflags', '+faststart',
        hero_mp4
    ]
    subprocess.run(cmd_mp4, check=True)

    hero_webm = os.path.join('public', 'hero', 'hero.webm')
    print(f"Exporting {hero_webm}...")
    cmd_webm = [
        ffmpeg, '-y',
        '-i', input_video,
        '-i', temp_wav_seamless,
        '-filter_complex', filter_complex,
        '-map', '[vouts]',
        '-map', '1:a',
        '-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0',
        '-c:a', 'libopus', '-b:a', '80k',
        hero_webm
    ]
    subprocess.run(cmd_webm, check=True)

    print("--- 3. Creating portrait-bust.webp and og.jpg with Headroom ---")
    cap = cv2.VideoCapture(input_video)
    fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
    cap.set(cv2.CAP_PROP_POS_FRAMES, int(fps * 2.0))
    ret, frame = cap.read()
    cap.release()

    if ret:
        # portrait-bust.webp: Add white padding above head so head is fully visible with headroom
        # Frame is 1920x1080. Crop head to chest: Y=0 to 600, X=740 to 1220 (480x600)
        # Pad top by 50px white
        h, w, _ = frame.shape
        bust_raw = frame[0:550, 740:1220] # 550x480
        # Add 50px white padding at top -> 600x480
        white_top = np.full((50, 480, 3), 255, dtype=np.uint8)
        bust_crop = np.vstack([white_top, bust_raw]) # 600x480
        
        # Whiten background
        bust_crop = np.clip(bust_crop.astype(np.float32) / 0.98, 0, 255).astype(np.uint8)
        bust_webp = os.path.join('public', 'portrait-bust.webp')
        cv2.imwrite(bust_webp, cv2.resize(bust_crop, (480, 600)), [cv2.IMWRITE_WEBP_QUALITY, 90])
        print(f"Saved {bust_webp}")

        # og.jpg: 1200x630 card image with padded top for subject
        og_img = np.full((630, 1200, 3), (238, 242, 244), dtype=np.uint8)
        subject_raw = frame[0:1080, 680:1280]
        # Pad top by 40px white
        white_subj_top = np.full((40, 600, 3), 255, dtype=np.uint8)
        subject_padded = np.vstack([white_subj_top, subject_raw[:1040]])
        subject_resized = cv2.resize(subject_padded, (500, 630))
        subject_resized = np.clip(subject_resized.astype(np.float32) / 0.98, 0, 255).astype(np.uint8)
        og_img[0:630, 650:1150] = subject_resized
        
        cv2.putText(og_img, "SAKSHI SHUKLA", (80, 260), cv2.FONT_HERSHEY_SIMPLEX, 1.8, (13, 13, 13), 3, cv2.LINE_AA)
        cv2.putText(og_img, "Data Analyst | Business Analyst | BI & Automation", (80, 320), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (119, 117, 111), 2, cv2.LINE_AA)
        cv2.putText(og_img, "Portfolio & Interactive Experience", (80, 370), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (169, 166, 160), 2, cv2.LINE_AA)

        og_jpg = os.path.join('public', 'og.jpg')
        cv2.imwrite(og_jpg, og_img, [cv2.IMWRITE_JPEG_QUALITY, 92])
        print(f"Saved {og_jpg}")

    for temp_f in [temp_wav_in, temp_wav_seamless]:
        if os.path.exists(temp_f):
            os.remove(temp_f)

    print("--- HERO ASSETS BUILD SUCCESSFUL WITH HEADROOM ---")

if __name__ == '__main__':
    build_assets()
