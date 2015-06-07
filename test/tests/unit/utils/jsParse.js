module("wipeout.utils.jsParse", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("removeCommentsTokenStrings", "", true, function(methods, classes, subject, invoker) {
    // arrange
	function tester (arg1, /*something//"'*/arg2) {
		/*and again //'"*/
		
		/*erterter*///asdasdasd
		
		var ttt = "kjsdbkls\"djbfljkb///*";
		var yyy = 'ddsssddkjsdbklsdjbfljkb///*';
	}
    
    // act
    var output = invoker(tester);
	var tokenNumber = parseInt(/\d+/.exec(/##token\d*##/.exec(output.output)[0])[0]);
	var doItMyself = tester.toString()
				.replace("/*something//\"'*/", "")
				.replace("// something \"'/*", "")
				.replace("/*and again //'\"*/", "")
				.replace("/*erterter*///asdasdasd", "")
				.replace('"kjsdbkls\\"djbfljkb///*"', "##token" + tokenNumber + "##")
				.replace("'ddsssddkjsdbklsdjbfljkb///*'", "##token" + (tokenNumber + 1) + "##");
    
    // assert
    equal(output.output, doItMyself);
    equal(output["##token" + tokenNumber + "##"], '"kjsdbkls\\"djbfljkb///*"');
    equal(output["##token" + (tokenNumber + 1) + "##"], "'ddsssddkjsdbklsdjbfljkb///*'");
});

testUtils.testWithUtils("removeCommentsTokenStringsAndBrackets", "", true, function(methods, classes, subject, invoker) {
	
    // arrange
	var b1 = "{{{hello 'something'}}}", b2 = "(((hello)))", b3 = "[[no no no[]]]";
    
    // act
    var output = invoker(b1 + b2 + b3);
	var tokenNumber = parseInt(/\d+/.exec(/##token\d*##/.exec(output.output)[0])[0]);
    
    // assert
    strictEqual(output.output, "##token" + tokenNumber + "##" + "##token" + (tokenNumber + 1) + "##" + "##token" + (tokenNumber + 2) + "##");
    strictEqual(output["##token" + tokenNumber + "##"], b1);
    strictEqual(output["##token" + (tokenNumber + 1) + "##"], b2);
    strictEqual(output["##token" + (tokenNumber + 2) + "##"], b3);
});

testUtils.testWithUtils("getArgumentNames", "vanilla", true, function(methods, classes, subject, invoker) {
	
    // arrange
    // act
    var output = invoker(function (a1, $b2, c3) {});
    
    // assert
    strictEqual(output.length, 3);
    strictEqual(output[0], "a1");
    strictEqual(output[1], "$b2");
    strictEqual(output[2], "c3");
});

testUtils.testWithUtils("getArgumentNames", "comment", true, function(methods, classes, subject, invoker) {
	
    // arrange
    // act
    var output = invoker(function (/*laksd*/a1, b2 /*asdasdasd*/, c3 /*ASDasDAASD*/) {});
    
    // assert
    strictEqual(output.length, 3);
    strictEqual(output[0], "a1");
    strictEqual(output[1], "b2");
    strictEqual(output[2], "c3");
});

testUtils.testWithUtils("getArgumentNames", "no args", true, function(methods, classes, subject, invoker) {
	
    // arrange
    // act
    var output = invoker(function ( ) {});
    
    // assert
    strictEqual(output.length, 0);
});

testUtils.testWithUtils("getArgumentNames", "no args, comment", true, function(methods, classes, subject, invoker) {
	
    // arrange
    // act
    var output = invoker(function ( /* hello */ ) {});
    
    // assert
    strictEqual(output.length, 0);
});