import fs from 'fs-extra-promise';

fs.readdirAsync(__dirname).then((filesName) => {
  filesName.forEach((fileName) => {
    fs.readFileAsync(`${__dirname}/${fileName}`).then((content) => {
      module.exports[fileName.split('.')[0]] = content;
    });
  });
});
