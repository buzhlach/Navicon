var Navicon = Navicon || {};

Navicon.nav_communication = (function () {
    /**
     * Если изменяется Тип связи, открываются или закрываются поля Телефон, Email.
     */
    let onTypeChanged = function () {

        let typeValue = Xrm.Page.getAttribute("nav_type").getValue();

        let phoneControl = Xrm.Page.getControl("nav_phone");
        let emailControl = Xrm.Page.getControl("nav_email");

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

            changeControlVisible(["nav_phone", "nav_email"], false);

            let typeAttr = Xrm.Page.getAttribute("nav_type");

            if (typeAttr) {
                onTypeChanged();
                typeAttr.addOnChange(onTypeChanged);
            }
            else {
                alert("try to get nav_type attr, but get null");
            }
        }
    }
})();