"use strict";

const Conditions = Symbol();
const ConditionNumber = Symbol();

module.exports = function(options) {
  return {
    HOOK: {
      init: function(document) {
        this[Conditions] = {};
        this[ConditionNumber] = 0;
      },
      finish: function(document) {
        Object.assign(document.Conditions, this[Conditions]);
      }
    },
    DSL: {
      registerCondition: function(condition){
        let conditionName = `_Condition${this[ConditionNumber]++}_`;
        this[Conditions][conditionName] = condition;
        return conditionName;
      },
      if: function(condition, thenValue, elseValue) {
        let conditionName = condition;
        if (typeof condition !== 'string') {
          conditionName = this.registerCondition(condition);
        }
        return {
          'Fn::If': [conditionName, thenValue, elseValue]
        };
      },
      any: function(target, validValues) {
        return this.or.apply(this, validValues.map(v => this.equals(target, v)));
      },
      unless: function(condition, thenValue, elseValue) {
        return this.if(condition, elseValue, thenValue);
      },
      ref_unless_empty: function(id) {
        return this.unless(this.ref_is_empty(id), this.ref(id), {
          Ref: 'AWS::NoValue'
        });
      },
      ref_is_empty: function(id) {
        return this.equals(this.ref(id), "");
      },
      or: function( /*...conditions*/ ) {
        var conditions = Array.prototype.slice.call(arguments);
        if (conditions.length > 10) {
          let i = Math.round(conditions.length / 2);
          let c1 = conditions.slice(0, i);
          let c2 = conditions.slice(i);
          return this.or(this.or.apply(this, c1), this.or.apply(this, c2));
        }
        if (conditions.length == 1) return conditions[0];
        else return {
          'Fn::Or': conditions
        };
      },
      and: function( /*...conditions*/ ) {
        var conditions = Array.prototype.slice.call(arguments);
        var wrapCondition = (condition) => typeof condition === 'string' ? {
            Condition: condition
          } : condition;
        if (conditions.length > 10) {
          let i = Math.round(conditions.length / 2);
          let c1 = conditions.slice(0, i);
          let c2 = conditions.slice(i);
          return this.and(this.and.apply(this, c1), this.and.apply(this, c2));
        }
        if (conditions.length == 1) return wrapCondition(conditions[0]);
        else return {
          'Fn::And': conditions.map(wrapCondition)
        };
      },
      equals: function(a, b) {
        return {
          'Fn::Equals': [a, b]
        }
      }
    }
  };
};
