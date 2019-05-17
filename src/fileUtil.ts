import * as fs from 'fs';
import mkdirp = require('mkdirp');

export function writeImageToFile(
    head: string,
    imageData: string[],
    startTime: [number, number]
): void {
    mkdirp.sync('output/');

    let image = head;

    for (let i = 0; i < imageData.length; i++) {
        image += imageData[i];
    }

    fs.writeFile('output/image.ppm', image, { flag: 'w+' }, err => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        const endTime = process.hrtime(startTime);
        console.info(
            'Execution time (hr): %ds %dms',
            endTime[0],
            endTime[1] / 1000000
        );
        process.exit(0);
    });
}
