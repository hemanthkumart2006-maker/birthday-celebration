const ffmpeg = require('ffmpeg-static');
const { execSync } = require('child_process');
const times = ['00:00:04', '00:00:05', '00:00:06', '00:00:07', '00:00:08'];
times.forEach((t, i) => {
    try {
        execSync(`"${ffmpeg}" -ss ${t} -i video.mp4 -frames:v 1 frame_unlock_${i}.jpg -y`);
    } catch(e) {}
});
