Class("wipeout.utils.jsParse", function () {
    
	function quoteIsEscaped (input, tokenIndex, isOpeningTag) {
		if (isOpeningTag)
			return false;
		
		var number = 0;
		while (input[tokenIndex - 1 - number] === "\\")
			number++;

		return number % 2 != 0;
	}
	
	var stringsAndComments = [{
		open: /'/gm,
		close: /'/gm,
		tokenize: true,
		isEscaped: quoteIsEscaped
	}, {
		open: /"/gm,
		close: /"/gm,
		tokenize: true,
		isEscaped: quoteIsEscaped
	}, {
		open: /\/\//gm,
		close: /(?=\r?\n)/gm,
		tokenize: false
	}, {
		open: /\/\*/gm,
		close: /\*\//gm,
		tokenize: false
	}];
	
	var brackets = [{
		open: /\{/gm,
		close: /\}/gm,
		tokenize: true,
		nested: true
	}, {
		open: /\(/gm,
		close: /\)/gm,
		tokenize: true,
		nested: true
	}, {
		open: /\[/gm,
		close: /\]/gm,
		tokenize: true,
		nested: true
	}];
	
	brackets.getFirst = stringsAndComments.getFirst = function (input, beginAt) {
		var tmp, beginning, token;
		for (var i = 0, ii = this.length; i < ii; i++) {
		
			this[i].open.lastIndex = beginAt;
			tmp = this[i].open.exec(input);
			if (tmp && (!beginning || tmp.index < beginning.index)) {
				beginning = tmp;
				token = this[i];
			}
		}
		
		if (!beginning)
			return;
		
		var index = 1, fOpen, fClose;
		do {
			token.close.lastIndex = token.open.lastIndex;
			while (token.nested && (fOpen = token.open.exec(input)) && token.isEscaped && token.isEscaped(input, fOpen.index, true)) ;
			while ((fClose = token.close.exec(input)) && token.isEscaped && token.isEscaped(input, fClose.index, false)) ;

			if (!fClose)
				throw "Invalid function string: " + input;	//TODE

			if (fOpen && fOpen.index < fClose.index)
				index++;
			else {
				token.open.lastIndex = token.close.lastIndex;
				index--;
			}
		} while (token.nested && index > 0);
		
		return {
			token: token,
			begin: beginning.index,
			end: token.close.lastIndex
		};
	};
	
	var uniqueToken = (function () {
		var i = 0;
		
		return function () {
			return "##token" + (++i) + "##"
		};
	}());
	
	function removeAndToken (input, tokens) {
		
		if (input instanceof Function)
			input = input.toString();
		
		var found = [{end: 0}], i = 0, token;
		while (token = tokens.getFirst(input, i)) {
			i = token.token.close.lastIndex;
			found.push(token);
		}
		
		found.push({end: input.length});
		
		var op = [], output = new splitter(), token;
		for (var i = 1, ii = found.length; i < ii; i++) {
			op.push(input.substring(found[i - 1].end, found[i].begin));
			
			if (found[i].token && found[i].token.tokenize) {
				output[token = uniqueToken()] = input.substring(found[i].begin, found[i].end);
				op.push(token);
			}
		}
		
		output.output = op.join("");
		return output;
	}
	
	var removeCommentsTokenStrings = function(input) {
        ///<summary>Takes a function string and removes comments and strings</summary>
        ///<param name="input" type="String|Function">The function</param>
        ///<returns type="Object">The output</returns>
		
		return removeAndToken(input, stringsAndComments);
    };
	
	var removeCommentsTokenStringsAndBrackets = function(input) {
        ///<summary>Takes a function string and removes comments, strings and anything within brackets</summary>
        ///<param name="input" type="String|Function">The function</param>
        ///<returns type="Object">The output</returns>
		
		var op1 = removeCommentsTokenStrings(input);
		var op2 = removeAndToken(op1.output, brackets);
		for (var i in op2)
			if (op2.hasOwnProperty(i) && i !== "output")
				op2[i] = op1.addTokens(op2[i]);
		
		for (var i in op1)
			if (i !== "output")
				op2[i] = op1[i];
		
		return op2;
    };
	
	var splitter = function () {}
	splitter.prototype.addTokens = function (toString) {
		for (var i in this)
			if (this.hasOwnProperty(i) && i !== "output")
				toString = toString.replace(i, this[i]);
		
		return toString;
	};
    
    function getArgumentNames (callback) {
        if (!(callback instanceof Function))
            return [];
        
        var args = /\([\w\,\s\$]*(?=\))/.exec(callback.toString().replace(/\/\*[\s\S]*?\*\//mg, ""));
        if (!args)
            return [];
        
        args = args[0].substr(1).replace(/\s/g, "");
        if (!args.length)
            return [];
        
        return args.split(",");
    }
    
    function jsParse() { };
    jsParse.getArgumentNames = getArgumentNames;
    jsParse.removeCommentsTokenStrings = removeCommentsTokenStrings;
    jsParse.removeCommentsTokenStringsAndBrackets = removeCommentsTokenStringsAndBrackets;
    return jsParse;
});