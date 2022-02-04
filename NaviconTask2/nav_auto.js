var Navicon = Navicon || {};

Navicon.nav_auto = (function () {

    /**
     * Имена control для пробега.
     */
    let usedConrols = ["nav_km", "nav_ownerscount", "nav_isdamaged"];

    /**
     * Если поле С пробегом true, то открывает поля, связанные с пробегом.
     */
    let hideUsedControlsIfUsedFalse = function () {

        let usedValue = Xrm.Page.getAttribute("nav_used").getValue();

        changeControlVisible(usedConrols, usedValue);
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

            changeControlVisible(usedConrols, false);

            let usedAttr = Xrm.Page.getAttribute("nav_used");

            if (usedAttr) {
                hideUsedControlsIfUsedFalse();
                usedAttr.addOnChange(hideUsedControlsIfUsedFalse);
            }
        }
    }
})();