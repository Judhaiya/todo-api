const chai = require("chai");
const chaiHttp = require("chai-http");
const { baseUrl } = require("../../utils/baseUrl");

chai.use(chaiHttp);
const expect = chai.expect;

module.exports.apiNegative = async function apiNegative(negativePayload) {
  const { url, payloadDetails, method, headers } = negativePayload;
  const apiPayload = payloadDetails.reduce((prev, cur) => {
    return Object.assign(prev, { [cur.key]: cur.correctValue });
  }, {});
  for (const formData of payloadDetails) {
    for (const invalidField of formData.wrongValues) {
      if (method === "get") {
        const res = await chai
          .request(baseUrl.local.SERVER_URL)
          [`${method}`](url)
          .set(headers !== null && headers)
          .query({
            ...apiPayload,
            [formData.key]: invalidField
          });
        expect(res.statusCode).to.equal(400);
      } else {
        const res = await chai
          .request(baseUrl.local.SERVER_URL)
          [`${method}`](url)
          .set(headers !== null ? headers : {})
          .send({ ...apiPayload, [formData.key]: invalidField });
        expect(res.statusCode).to.equal(400);
      }
    }
    const { [formData.key]: key, ...correctFields } = apiPayload;
    const res = await chai
      .request(baseUrl.local.SERVER_URL)
      [`${method}`](url)
      .send(correctFields)
      .set(headers !== null ? headers : {});
    expect(res.statusCode).to.equal(400);
  }
};
