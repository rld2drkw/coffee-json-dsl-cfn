"use strict";

module.exports = function(options) {
  this.use(`${__dirname}/plugins/cfn-base`, options);
  this.use(`${__dirname}/plugins/cfn-conditional`, options);
  return {
    DOCUMENT: {
      AWSTemplateFormatVersion: "2010-09-09",
      Parameters: {},
      Resources: {},
      Conditions: {},
      Outputs: {},
      Mappings: {},
    }
  };
}
