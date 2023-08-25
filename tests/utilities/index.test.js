const chai = require("chai");
const { convertToBase64 } = require("../../services/convertToBase64");
const { deleteFileInDisk } = require("../../services/fileUtility");
const { normalizePath } = require("../../services/formatter");

const path = require("path");
const fs = require("fs");
const expect = chai.expect;


describe("base64Testing", () => {
  it("passes if on decoding it should generate the expected image", async () => {
    const base64Image = convertToBase64(path.join("utils", "assets", "img-2.jpg"));
    const buffer = Buffer.from(base64Image, "base64");
    fs.writeFileSync(path.join("tests", "uploads", "decode-img.jpg"), buffer);
    const decodeImageBase64 = convertToBase64(path.join("tests", "uploads", "decode-img.jpg"));
    expect(base64Image).to.eql(decodeImageBase64);
    deleteFileInDisk(path.join("tests", "uploads", "decode-img.jpg"));
  });
});

describe("deleteFileInDisk", () => {
  it("passes if it delete file in disk", () => {
    fs.writeFileSync(path.join("tests", "uploads", "sampletext.txt"), "hello world");
    deleteFileInDisk(path.join("tests", "uploads", "sampletext.txt"));
    try {
      deleteFileInDisk(path.join("tests", "uploads", "sampletext.txt"));
    } catch (err) {
      expect(err.message).to.be.ok;
    }
  });
});

describe("formatPath", () => {
  it("passes test case if it format file as expected", () => {
    expect(normalizePath("utils/assets/image")).to.eql("utils\\assets\\image");
  });
  it("passes testcase if it is formatted while the string is not in xpected format", () => {
    expect(normalizePath("utils-assets-image")).to.eql("utils-assets-image");
  });
})