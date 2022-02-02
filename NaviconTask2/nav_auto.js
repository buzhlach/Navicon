var Navicon = Navicon || {};

Navicon.nav_auto = (function () {
    /**
     * Если поле С пробегом true, то открывает поля, связанные с пробегом.
     */
    let onUsedChanged = function () {

        let usedValue = Xrm.Page.getAttribute("nav_used").getValue();
        changeControlVisible(["nav_km", "nav_ownerscount", "nav_isdamaged"], usedValue);
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

            changeControlVisible(["nav_km", "nav_ownerscount", "nav_isdamaged"], false);

            let usedAttr = Xrm.Page.getAttribute("nav_used");

            if (usedAttr) {
                onUsedChanged();
                usedAttr.addOnChange(onUsedChanged);
            }
            else {
                alert("try to get nav_type attr, but get null");
            }
        }
    }
})();