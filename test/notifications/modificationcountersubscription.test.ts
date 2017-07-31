"use strict";

import { assert } from "chai";
import { ModificationCounterSubscription } from "../../src/notifications/modificationcountersubscription";
import { SummaryDataProxy } from "../../src/notifications/summarydata";
import * as xml2js from "xml2js";

suite("ModificationCounterSubscription", () => {
    test("should verify constructor", function() {
        const modificationCounter : ModificationCounterSubscription = new ModificationCounterSubscription();
        assert.equal(modificationCounter.serialize(), "");
    });

    test("should verify constructor - with undefined param", function(done) {
        const expectedResult : string = `v;p:_Root,w;p:_Root,t;p:_Root,u;p:_Root,r;p:_Root,s;p:_Root,a;p:_Root,c;p:_Root,e;p:_Root,m;p:_Root,n;p:_Root,l;p:_Root,p;p:_Root,q;p:_Root,I;p:_Root,K;p:_Root,v;p:project2,w;p:project2,t;p:project2,u;p:project2,r;p:project2,s;p:project2,a;p:project2,c;p:project2,e;p:project2,m;p:project2,n;p:project2,l;p:project2,p;p:project2,q;p:project2,I;p:project2,K;p:project2,x;u:239,i;u:239,g;u:239,h;u:239,j;u:239,F;u:239,E;u:239,G;u:239,`;
        xml2js.parseString(summaryObjXml, (err, obj) => {
            if (err) {
                done("Unexpected error during parse of summaryObjXml.");
            }
            const summeryData : SummaryDataProxy = new SummaryDataProxy(obj.Summary);
            const modificationCounter : ModificationCounterSubscription =
                ModificationCounterSubscription.fromTeamServerSummaryData(summeryData, "239");
            assert.equal(modificationCounter.serialize(), expectedResult);
            done();
        });
    });
});

const summaryObjXml : string = `<Summary>
  <myVisibleProjects class="set">
    <string>_Root</string>
    <string>project2</string>
  </myVisibleProjects>
  <mySummaryCounter>637</mySummaryCounter>
</Summary>`;
