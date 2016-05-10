"use strict";

const Cfn = require('coffee-json-dsl');

describe('base', function(){
  let cfn　= null;
  beforeEach(function(){
    cfn = new Cfn();
    cfn.use(`${__dirname}/../src/coffee-json-dsl-cfn`);
  });
  describe('HOOK', function() {
    describe('finish', function() {
      it('remove empty elements from generated document', function() {
        cfn.add('Resources.Test = "resource1"');
        let templateString = cfn.generate();
        let templateObj = JSON.parse(templateString);
        expect(templateObj.Resources).toBeDefined();
        expect(templateObj.Parameters).toEqual({});
        expect(templateObj.Outputs).toEqual({});
        expect(templateObj.Conditions).toEqual({});
        expect(templateObj.Mappings).toEqual({});
      });
    });
  });
  describe('ROOT', function() {
    it('defines CloudFormation elements', function(){
      cfn.add('Resources.Test = "resource1"');
      cfn.add('Parameters.Test = "parameter1"');
      cfn.add('Outputs.Test = "output1"');
      cfn.add('Conditions.Test = "condition1"');
      cfn.add('Mappings.Test = "mapping1"');
      let templateString = "";
      expect(()=>{
        templateString = cfn.generate();
      }).not.toThrow();
      let templateObj = JSON.parse(templateString);
      expect(templateObj.AWSTemplateFormatVersion).toBeDefined();
      expect(templateObj.Resources.Test).toEqual('resource1');
      expect(templateObj.Parameters.Test).toEqual('parameter1');
      expect(templateObj.Conditions.Test).toEqual('condition1');
      expect(templateObj.Mappings.Test).toEqual('mapping1');
    });
  });

  describe('DSL', function() {
    describe('ref', function(){
      it('generates Ref node', function() {
        cfn.add('Resources.Test = $.ref("id")');
        let templateObj = JSON.parse(cfn.generate());
        expect(templateObj.Resources.Test).toEqual({'Ref': 'id'});
      });
    });

    describe('join', function(){
      it('generates Fn::Join node', function() {
        cfn.add('Resources.Test = $.join(",", {a:1},{b:2})');
        let templateObj = JSON.parse(cfn.generate());
        expect(templateObj.Resources.Test).toEqual({'Fn::Join': [',', [{a:1}, {b:2}]]});
      });
    });

    describe('concat', function(){
      it('generates Fn::Join node with empty separator', function() {
        cfn.add('Resources.Test = $.concat({a:1},{b:2})');
        let templateObj = JSON.parse(cfn.generate());
        expect(templateObj.Resources.Test).toEqual({'Fn::Join': ['', [{a:1}, {b:2}]]});
      });
    });

    describe('getAtt', function() {
      it('generates Fn::GetAtt node', function() {
        cfn.add('Resources.Test = $.getAtt("foo","bar")');
        let templateObj = JSON.parse(cfn.generate());
        expect(templateObj.Resources.Test).toEqual({'Fn::GetAtt': ['foo', 'bar']});
      });
    });
  });
});
