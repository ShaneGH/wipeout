

var watched = wipeout.base.watched;
var watch = wipeout.base.watch;

function testMe (moduleName, buildSubject) {

    module(moduleName, {
        setup: function() {
        },
        teardown: function() {
        }
    });

    testUtils.testWithUtils("observe", "multiple changes, 1 registration", false, function(methods, classes, subject, invoker) {
        // arrange
        var subject = buildSubject();
        subject.val = "aaa";
        subject.observe("val", function(oldVal, newVal) {
            strictEqual(oldVal, "aaa");
            strictEqual(newVal, "ccc");
            start();
        });

        // act
        subject.val = "bbb";
        subject.val = "ccc";

        stop();
    });


    testUtils.testWithUtils("observe", "2 properties", false, function(methods, classes, subject, invoker) {
        // arrange
        var subject = buildSubject();
        subject.val1 = "aaa";
        subject.val2 = "bbb";
        
        subject.observe("val1", function(oldVal, newVal) {
            strictEqual(oldVal, "aaa");
            strictEqual(newVal, "ccc");
            start();
        });
        
        subject.observe("val2", function(oldVal, newVal) {
            strictEqual(oldVal, "bbb");
            strictEqual(newVal, "ddd");
            start();
        });

        // act
        subject.val1 = "ccc";
        subject.val2 = "ddd";

        stop(2);
    });

    testUtils.testWithUtils("observe", "delete", false, function(methods, classes, subject, invoker) {
        // arrange    
        var subject = buildSubject();
        subject.val = "aaa";
        subject.observe("val", function(oldVal, newVal) {
            strictEqual(oldVal, "aaa");
            strictEqual(newVal, undefined);
            start();
        });

        // act
        subject.del("val");

        stop();
    });

    testUtils.testWithUtils("observe", "multiple changes, 2 registrations", false, function(methods, classes, subject, invoker) {
        // arrange
        var subject = buildSubject();
        subject.val = "aaa";

        var number = 0;
        subject.observe("val", function(oldVal, newVal) {
            if(number === 0) {
                strictEqual(oldVal, "aaa");
                strictEqual(newVal, "bbb");
            } else if(number === 1) {
                strictEqual(oldVal, "bbb");
                strictEqual(newVal, "ccc");
            } else {
                ok(false);
            }

            number++;

            start(1);
        }, null, true);

        // act
        subject.val = "bbb";
        subject.val = "ccc";

        stop(2);
    });

    testUtils.testWithUtils("observe", "disposal", false, function(methods, classes, subject, invoker) {
        // arrange
        var subject = buildSubject();
        subject.val = "aaa";
        var dispose = subject.observe("val", function(oldVal, newVal) {
            ok(false, "should not have been called");
        });

        // act
        dispose.dispose();
        delete subject.val;

        stop();
        setTimeout(function(){
            start();
            ok(true);
        }, 10);
    });

    testUtils.testWithUtils("observe", "simple change, complex functions are in pathWatch.js", false, function(methods, classes, subject, invoker) {
        // arrange
        var subject = buildSubject();
        subject.aa = buildSubject();
        subject.aa.bb = buildSubject();
        subject.aa.bb.cc = 11;
        
        var disp = subject.observe("aa.bb.cc", function(oldVal, newVal) {
            strictEqual(oldVal, 11);
            strictEqual(newVal, 22);
            start();
        });

        // act
        stop();
        subject.aa.bb.cc = 22;
        ok(disp instanceof wipeout.base.pathWatch);
    });

    testUtils.testWithUtils("computed", "simple change, complex functions are in computed.js", false, function(methods, classes, subject, invoker) {
        // arrange
        var subject = buildSubject();
        subject.val1 = buildSubject();
        subject.val1.val2 = "hello";
        subject.val3 = "world";

        var disp = subject.computed("comp", function() {
            return this.val1.val2 + " " + this.val3;
        });

        subject.observe("comp", function(oldVal, newVal) {
            strictEqual(oldVal, "hello world");
            strictEqual(newVal, "hello shane");
            start();
        });

        // act
        stop();
        subject.val3 = "shane";
        
        // assert
        ok(disp instanceof wipeout.base.computed);
    });
}

testMe("wipeout.base.watched", function() { return new watched(); });
testMe("wipeout.base.watched, do not use prototype", function() { return watch(); });