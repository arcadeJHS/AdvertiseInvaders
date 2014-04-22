var JYI = JYI || (function() {

    function JoystickIno() {
        this.handler = null;
    }
    JoystickIno.prototype = {
        register: function(fn) {
            this.handler = fn;
        },
        trigger: function(o, scope) {
            var scope = scope || window;
            this.handler.call(scope, o);
        }
    };

    return {
        config: function(o) {
            var j = new JoystickIno();
            j.register(o.inputHandler);

            var ws = new WebSocket(o.wsAddress);
            ws.addEventListener('open', function() {
                ws.addEventListener('message', function(e) {
                    var button = JSON.parse(e.data);
                    j.trigger(button);
                });
            });
        }
    };

}());