const chai = require("chai");
const { uploadFile, deleteFileInStorage, getDownlodableUrl, downloadFileFromBucket } = require("../../services/firebase/actionFunctions");
const { convertToBase64 } = require("../../services/convertToBase64");
const path = require("path");
const { checkForUploadedImg } = require("../../tests/features/uploadImageCheck");
const { deleteFileInDisk } = require("../../services/fileUtility");
const https = require("https");
const fs = require("fs");

const expect = chai.expect;

const fileLocationInBucket = "documents/image/random-img.jpg";
const tmpFilePath = path.join("tmp", "uploads", "img-2.jpg");
const imgUploadedPath = path.join("utils", "assets", "img-2.jpg");
const downloadFileInDisk = (downloadbleImageUrl, imgDownloadedPath) => {
  return new Promise((resolve, reject) => {
    https.get(downloadbleImageUrl, (res) => {
      const writeStream = fs.createWriteStream(imgDownloadedPath);
      res.pipe(writeStream);
      writeStream.on("finish", () => {
        writeStream.close();
        const storageBucketImg = convertToBase64(imgDownloadedPath);
        const userUplodedImg = convertToBase64(imgUploadedPath);
        resolve(expect(storageBucketImg).to.eql(userUplodedImg));
      });
    });
  });
};

describe("uploadFileInCloudStorage", () => {
  before(async () => {
    fs.copyFileSync(path.join("utils", "assets", "img-2.jpg"), path.join("tmp", "uploads", "img-2.jpg"));
  });
  it("on downloading the uploaded image and image in cloud storage should be same", async () => {
    await uploadFile(tmpFilePath, fileLocationInBucket);
    await checkForUploadedImg(path.join("tests", "uploads", "random-img.jpg"), imgUploadedPath, fileLocationInBucket);
  })
  after(async () => {
    await deleteFileInStorage(fileLocationInBucket);
  });
});

describe("deleteFileInCloudStorage", () => {
  before(async () => {
    fs.copyFileSync(path.join("utils", "assets", "img-2.jpg"), path.join("tmp", "uploads", "img-2.jpg"));
    await uploadFile(tmpFilePath, fileLocationInBucket);
    await deleteFileInStorage(fileLocationInBucket);
  });
  it("passes if file is deleted in storage", async () => {
    try {
      await deleteFileInStorage(fileLocationInBucket);
    } catch (err) {
      expect(err.name).to.equal("request error");
      expect(err.code).to.equal(400);
      expect(err.msg).to.equal("notFound");
    };
  });
});

describe("downloadingFileFromStorage", () => {
  before(async () => {
    fs.copyFileSync(path.join("utils", "assets", "img-2.jpg"), path.join("tmp", "uploads", "img-2.jpg"));
    await uploadFile(tmpFilePath, fileLocationInBucket);
  });

  it("passes if download image is the one we have uploaded", async () => {
    await downloadFileFromBucket(fileLocationInBucket);
    await checkForUploadedImg(path.join("tests", "uploads", "random-img.jpg"), imgUploadedPath, fileLocationInBucket);
  })
  after(async () => {
    await deleteFileInStorage(fileLocationInBucket);
  });
});

describe("generateDownloableUrl", () => {
  const imgDownloadedPath = path.join("tests", "uploads", "random-image.jpg");
  before(async () => {
    fs.copyFileSync(path.join("utils", "assets", "img-2.jpg"), path.join("tmp", "uploads", "img-2.jpg"));
    await uploadFile(tmpFilePath, fileLocationInBucket);
  });

  it("passes if the downloadble url generates the expected image", async () => {
    const downloadbleImageUrl = await getDownlodableUrl(fileLocationInBucket);
    await downloadFileInDisk(downloadbleImageUrl, imgDownloadedPath);
  });
  after(async () => {
    await deleteFileInStorage(fileLocationInBucket);
    deleteFileInDisk(imgDownloadedPath);
  });
});
