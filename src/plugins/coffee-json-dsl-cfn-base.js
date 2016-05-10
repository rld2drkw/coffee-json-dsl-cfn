"use strict";

module.exports = function(options) {
  return {
    DSL: {
      concat: function( /*...parts*/ ) {
        var parts = Array.prototype.slice.call(arguments);
        var args = [''].concat(parts);
        return this.join.apply(this, args);
      },
      join: function( /*separator,...parts*/ ) {
        var parts = Array.prototype.slice.call(arguments);
        let separator = parts.shift();

        return {
          'Fn::Join': [separator, parts]
        };
      },
      ref: function(logicalId) {
        return {
          Ref: logicalId
        };
      },
      getAtt: function(logicalId, attributeName) {
        return {
          'Fn::GetAtt': [logicalId, attributeName]
        };
      },
      stackname: function(){
        return this.ref('AWS::StackName');
      }
    }
  };
}
