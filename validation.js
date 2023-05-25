

function Validator(options) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {}

    function validate(inputElement, rule) {

        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)

        var errorMessage

        var rules = selectorRules[rule.selector];

        // 各ルールをループして確認します
        // エラーが発生した場合はテストを停止します
        for (var i = 0; i < rules.length; i++) {
            errorMessage = rules[i](inputElement.value);
            if (errorMessage) break
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }

        return !errorMessage;

    }
    var formElement = document.querySelector(options.form)

    if (formElement) {

        // '次に進む'を押す
        // ボタンクリックイベントをリッスンする
        formElement.onsubmit = function (e) {
            e.preventDefault();
            var isFormValid = true;

            // 実行
            // 各ルールをループして確認します
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                // JavaScriptで送信する場合
                if (typeof options.onSubmit === 'function') {

                    var enableInputs = formElement.querySelectorAll('[name]');

                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        return values;
                    }, {}); 
                    
                    options.onSubmit(formValues);
                }
                // デフォルトの動作でケースを送信する
                else {
                    formElement.submit();
                }
            }

        }




        // 各ルールをループして確認します ( blur, input, ...イベントをリッスンする)
        options.rules.forEach(function (rule) {

            // 各入力のルールを保存する
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function (inputElement) {
                // 入力からのブラーの処理
                inputElement.onblur = function () {
                    validate(inputElement, rule)
                }

                // ユーザーが入力するたびに処理
                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }
            });
        })
    }
}

// ルールの定義　(入力時は名前、電子メール、...)
// 1. エラーが発生した場合 => エラーメッセージを返す
// 2. エラーがない場合 => 何も返しません
Validator.isRequired = function (selector) {
    return {
        selector: selector,
        test: function (value, message) {
            return value ? undefined : message || '入力してください'
        }
    }
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
            return regex.test(value) ? undefined : message || '入力してください'
        }
    }
}

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || '最低6文字が必要です'
        }
    }
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'パスワードが一致しません'
        }
    }
}