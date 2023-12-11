var messages = {
    'ru': {
        'email': 'Почта не подходит, или отсуствует',
        'tel': 'Телефон не подходит, или отсуствует',
        'empty': 'Не должно быть пустыми',
        'range': 'Должно быть от {1} до {2}',
        'less': 'Не должно быть больше {1}',
        'greater': 'Не должно быть меньше {1}',
    },
    'en': {
        'email': 'Email not valid, or empty',
        'tel': 'Tel not valid, or empty',
        'empty': 'Must not be empty',
        'range': 'Must be between {1} and {2}',
        'less': 'Not more than {1}',
        'greater': 'Not less than {1}',
    },
    'kk': {
        'email': 'Пошта сәйкес емес немесе жоқ',
        'tel': 'Телефон жұмыс істемейді немесе жоқ',
        'empty': 'Бос болмауы керек',
        'range': '{1} және {2} аралығында болуы керек',
        'less': '{1} аспауы керек',
        'greater': '{1} кем болмауы керек',
    }
};
var ValidateMessage = /** @class */ (function () {
    function ValidateMessage() {
    }
    ValidateMessage.message = function (type) {
        var fields = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            fields[_i - 1] = arguments[_i];
        }
        var message = messages[ValidateMessage.lang][type];
        var index = 1;
        for (var _a = 0, fields_1 = fields; _a < fields_1.length; _a++) {
            var value = fields_1[_a];
            message = message.replace("{".concat(index, "}"), value);
            index += 1;
        }
        return message;
    };
    ValidateMessage.lang = "en";
    return ValidateMessage;
}());
export default ValidateMessage;
