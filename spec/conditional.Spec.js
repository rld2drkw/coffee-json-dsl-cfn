"use strict";

const Cfn = require('coffee-json-dsl');
const toContainMatcher = require('./helpers/toContainMatcher');

describe('conditional', function() {
  let cfn = null;
  beforeEach(function() {
    jasmine.addMatchers(toContainMatcher);
  });

  beforeEach(function() {
    cfn = new Cfn();
    cfn.use(`${__dirname}/../src/coffee-json-dsl-cfn`)
  });

  it('is loaded by default', function() {
    expect(cfn.plugins).toContain('coffee-json-dsl-cfn-conditional');
  });
  describe('DSL', function() {
    describe('equals', function() {
      it('generates Fn::Equals node', function() {
        cfn.load(`${__dirname}/fixtures/templates/exampleEquals.coffee`);

        let templateObj = JSON.parse(cfn.generate());
        expect(templateObj.Conditions.Example).toEqual({
          'Fn::Equals': [1, 2]
        });
      });
    });
    describe('and', function() {
      it('generates Fn::And node if multiple conditions specified', function() {
        cfn.add('Resources.Test = $.and({a:1}, {b:2})')
        let templateObj = JSON.parse(cfn.generate());
        expect(templateObj.Resources.Test).toEqual({
          'Fn::And': [{
            a: 1
          }, {
            b: 2
          }]
        });
      });

      it('reflects the specified node if a single condition specified', function() {
        cfn.add('Resources.Test = $.and({a:1})')
        let templateObj = JSON.parse(cfn.generate());
        expect(templateObj.Resources.Test).toEqual({
          a: 1
        });
      });

      it('translates string as condition', function() {
        cfn.add('Resources.Test = $.and("condition1", "condition2")');
        let templateObj = JSON.parse(cfn.generate());
        expect(templateObj.Resources.Test).toEqual({
          'Fn::And': [{
            Condition: 'condition1'
          }, {
            Condition: 'condition2'
          }]
        });

      })

      it('generates a Fn::And nodes if 10 conditions specified', function() {
        cfn.add(`Resources.Test = $.and({a:1},{b:2},{c:3},{d:4},{e:5},{f:6},{g:7},{h:8},{i:9},{j:10})`)
        let templateObj = JSON.parse(cfn.generate());
        expect(templateObj.Resources.Test).toEqual({
          'Fn::And': [{
            a: 1
          }, {
            b: 2
          }, {
            c: 3
          }, {
            d: 4
          }, {
            e: 5
          }, {
            f: 6
          }, {
            g: 7
          }, {
            h: 8
          }, {
            i: 9
          }, {
            j: 10
          }]
        });
      });
      it('generates nested Fn::And nodes if more than 10 conditions specified', function() {
        cfn.add(`Resources.Test = $.and({a:1},{b:2},{c:3},{d:4},{e:5},{f:6},{g:7},{h:8},{i:9},{j:10},{k:11})`)
        let templateObj = JSON.parse(cfn.generate());
        expect(templateObj.Resources.Test).toEqual({
          'Fn::And': [{
            'Fn::And': [{
              a: 1
            }, {
              b: 2
            }, {
              c: 3
            }, {
              d: 4
            }, {
              e: 5
            }, {
              f: 6
            }]
          }, {
            'Fn::And': [{
              g: 7
            }, {
              h: 8
            }, {
              i: 9
            }, {
              j: 10
            }, {
              k: 11
            }]
          }]
        });
      });
    });
    describe('or', function() {
      it('generates Fn::Or node if multiple conditions specified', function() {
        cfn.add(`Resources.Test = $.or({a:1},{b:2})`)
        let templateObj = JSON.parse(cfn.generate());
        expect(templateObj.Resources.Test).toEqual({
          'Fn::Or': [{
            a: 1
          }, {
            b: 2
          }]
        });
      });
      it('reflects the specified node if a single condition specified', function() {
        cfn.add('Resources.Test = $.or({a:1})')
        let templateObj = JSON.parse(cfn.generate());
        expect(templateObj.Resources.Test).toEqual({
          a: 1
        });
      });
      it('generates a Fn::Or nodes if 10 conditions specified', function() {
        cfn.add(`Resources.Test = $.or(1,2,3,4,5,6,7,8,9,10)`)
        let templateObj = JSON.parse(cfn.generate());
        expect(templateObj.Resources.Test).toEqual({
          'Fn::Or': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        });
      });
      it('generates nested Fn::Or nodes if more than 10 conditions specified', function() {
        cfn.add(`Resources.Test = $.or(1,2,3,4,5,6,7,8,9,10,11)`)
        let templateObj = JSON.parse(cfn.generate());
        expect(templateObj.Resources.Test).toEqual({
          'Fn::Or': [{
            'Fn::Or': [1, 2, 3, 4, 5, 6]
          }, {
            'Fn::Or': [7, 8, 9, 10, 11]
          }]
        });
      });
    });
    describe('if', function() {
      it('generates Fn::If node', function() {
        cfn.add('Resources.Test = $.if("Condition1", 1, 2)');
        let templateString = cfn.generate();
        let templateObj = JSON.parse(templateString);
        expect(templateObj.Resources.Test).toEqual({
          'Fn::If': ['Condition1', 1, 2]
        });
      });
      it('accepts condition object as the condition argument', function() {
        cfn.add(`Resources.Test = $.if($.equals(1,2), 1, 2)`);

        let templateString = cfn.generate();
        let templateObj = JSON.parse(templateString);

        expect(templateObj.Resources.Test['Fn::If']).toEqual(jasmine.any(Array));
        let conditionName = templateObj.Resources.Test['Fn::If'][0];
        expect(conditionName).toEqual(jasmine.any(String));
        expect(templateObj.Conditions[conditionName])
          .toEqual({
            'Fn::Equals': [1, 2]
          });
      })
    });
    describe('registerCondition', function() {
      it('generates condition name from condition object', function() {
        cfn.add('Resources.Test = $.registerCondition($.equals(1,2))');

        let templateString = cfn.generate();
        let templateObj = JSON.parse(templateString);

        expect(templateObj.Resources.Test).toEqual('_Condition0_');
        expect(templateObj.Conditions._Condition0_).toEqual({
          'Fn::Equals': [1, 2]
        });
      });
    });
  });
});
