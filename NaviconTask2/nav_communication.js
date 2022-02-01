var Navicon = Navicon || {};

Navicon.nav_communication = (function () {
    /**
     * Если изменяется Тип связи, открываются или закрываются поля Телефон, Email.
     * @param {*} context 
     */
    let onTypeChanged = function (context) {
        let formContext = context.getFormContext();

        let typeValue = formContext.getAttribute("nav_type").getValue();

        let phoneControl = formContext.getControl("nav_phone");
        let emailControl = formContext.getControl("nav_email");

        if (typeValue) {
            if (phoneControl && typeValue == 1) {
                phoneControl.setVisible(true);
                emailControl.setVisible(false);
            }
            else if (emailControl && typeValue == 2) {
                emailControl.setVisible(true);
                phoneControl.setVisible(false);
            }
        }
        else {
            changeControlVisible(context, ["nav_phone", "nav_email"], false);
        };
    }

    /**
 * Меняет видимость у control именам controlNames.
 * @param {*} context 
 * @param {Array} controlNames Имена всех control.
 * @param {boolean} visible Параметр видимости.
 */
    let changeControlVisible = function (context, controlNames, visible) {
        controlNames.forEach(element => {
            let formContext = context.getFormContext();
            let disableControl = formContext.getControl(element);

            if (disableControl) {
                disableControl.setVisible(visible);
            }
            else {
                console.log("try to get" + element + "control ,but get null");
            }
        });
    }
    return {

        /**
         * Выполняется при загрузке формы.
         * @param {*} context 
         */
        onLoad: function (context) {
            let formContext = context.getFormContext();

            if (!formContext) {
                alert("try to get formContext control, but get null");
            }
            changeControlVisible(context, ["nav_phone", "nav_email"], false);

            let typeAttr = formContext.getAttribute("nav_type");

            if (typeAttr) {
                onTypeChanged(context);
                typeAttr.addOnChange(onTypeChanged);
            }
            else {
                alert("try to get nav_type attr, but get null");
            }
        }
    }
})();