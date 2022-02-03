var Navicon = Navicon || {};

Navicon.nav_auto = (function () {
    /**
     * Установка обработчков для изменения Номера договора.
     */
    let onUsedChanged = function () {

        let usedAttr = Xrm.Page.getAttribute("nav_used");

        if (!usedAttr) {
            alert("don't have all fields for autoChanged");
        }
        hideUsedControlsIfUsedFalse();
        usedAttr.addOnChange(hideUsedControlsIfUsedFalse);

    }

    /**
     * Если поле С пробегом true, то открывает поля, связанные с пробегом.
     */
    let hideUsedControlsIfUsedFalse = function () {
        let usedConrols = ["nav_km", "nav_ownerscount", "nav_isdamaged"];

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

            let usedConrols = ["nav_km", "nav_ownerscount", "nav_isdamaged"];
            changeControlVisible(usedConrols, false);
            onUsedChanged();
        }
    }
})();