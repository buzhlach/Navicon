var Navicon = Navicon || {};

Navicon.nav_communication = (function () {
    /**
     * Установка обработчков для изменения Тип связи.
     */
    let onTypeChanged = function () {

        let typeAttr = Xrm.Page.getAttribute("nav_type");

        if (!typeAttr) {
            alert("don't have all fields for onTypeChanged");
        }
        hidePhoneOrEmail()
        typeAttr.addOnChange(hidePhoneOrEmail);
    }

    /**
     * Если изменяется Тип связи, открываются или закрываются поля Телефон, Email.
     */
    let hidePhoneOrEmail = function () {
        let typeValueAttr = Xrm.Page.getAttribute("nav_type");
        let phoneControl = Xrm.Page.getControl("nav_phone");
        let emailControl = Xrm.Page.getControl("nav_email");

        if (!typeValueAttr || !phoneControl || !emailControl) {
            alert("don't have all fields for hidePhoneOrEmail");
        }

        typeValue = typeValueAttr.getValue();

        if (typeValue) {
            if (typeValue == 1) {
                phoneControl.setVisible(true);
                emailControl.setVisible(false);
            }
            else if (typeValue == 2) {
                emailControl.setVisible(true);
                phoneControl.setVisible(false);
            }
        }
        else {
            let communicationControls = ["nav_phone", "nav_email"];
            changeControlVisible(communicationControls, false);
            changeControlVisible(["nav_phone", "nav_email"], false);
        };
    }

    /**
 * Меняет видимость у control именам controlNames.
 * @param {Array} controlNames Имена всех control.
 * @param {boolean} visible Параметр видимости.
 */
    let changeControlVisible = function (controlNames, visible) {
        controlNames.forEach(element => {
            let disableControl = Xrm.Page.getControl(element);

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
         */
        onLoad: function () {

            let communicationControls = ["nav_phone", "nav_email"];
            changeControlVisible(communicationControls, false);
            onTypeChanged();
        }
    }
})();