const chai = require("chai");
const chaiHttp = require("chai-http");
const { baseUrl } = require("../../utils/baseUrl");

chai.use(chaiHttp);
const expect = chai.expect;

module.exports.apiNegative = async function apiNegative(negativePayload) {
  const { url, payloadDetails, method, headers } = negativePayload;
  const correctDetails = payloadDetails.reduce((prev, cur) => {
    return Object.assign(prev, { [cur.key]: cur.correctValue });
  }, {});
  for (const formData of payloadDetails) {
    for (const wrongValue of formData.wrongValues) {
      const res = await chai.request(baseUrl.local.SERVER_URL)[`${method}`](url)
        .send({ ...correctDetails, [formData.key]: wrongValue })
        .set(headers !== "" && headers);
      expect(res.statusCode).to.equal(400);
    }
    const { [formData.key]: removedProperty, ...correctFields } = correctDetails;
    const res = await chai.request(baseUrl.local.SERVER_URL)[`${method}`](url)
      .send(correctFields)
      .set(headers !== "" && headers);
    expect(res.statusCode).to.equal(400);
  };
};
