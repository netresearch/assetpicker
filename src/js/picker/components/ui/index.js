var cssLoaded = false;
var extend = require('extend');
var util = require('../../util');

module.exports = require('../../../shared/util/createClass')({
    construct: function (element, picker) {
        if (!cssLoaded) {
            util.loadCss(picker.getDistUrl() + '/css/picker-ui.css');
        }

        this.config = extend(
            {
                unique: true,
                readonly: false
            },
            picker.options.ui,
            {
                readonly: element.hasAttribute('data-ro') ? ['false', '0'].indexOf(element.getAttribute('data-ro')) === -1 : undefined,
                unique: element.hasAttribute('data-unique') ? ['false', '0'].indexOf(element.getAttribute('data-unique')) === -1 : undefined
            }
        );

        this.add = false;
        this.propagate = false;
        this.picker = picker;
        this.element = element;
        this.picked = element.hasAttribute('value') ? JSON.parse(element.getAttribute('value')) || [] : [];
        if (this.picked.constructor !== Array) {
            this.picked = [this.picked];
        }
        this.render();

        var that = this;
        picker.on('pick', function (picked) {
            if (!that.propagate && this.element === element) {
                var pickedArr = picked.constructor !== Array ? [picked] : picked;
                if (that.add) {
                    for (var i = 0; i < pickedArr.length; i++) {
                        var contains = false;
                        if (that.config.unique) {
                            for (var j = 0; j < that.picked.length; j++) {
                                if (that.picked[j].storage === pickedArr[i].storage && that.picked[j].id === pickedArr[i].id) {
                                    contains = true;
                                    break;
                                }
                            }
                        }
                        if (!contains) {
                            that.picked.push(pickedArr[i]);
                        }
                    }
                    pickedArr = that.picked;
                }
                that.pick(pickedArr);
                return false;
            }
            that.propagate = false;
            that.add = false;
        });
    },
    pick: function (picked) {
        this.picked = picked;
        this.propagate = true;
        this.picker.element = this.element;
        this.picker.pick(this.picker._getPickConfig(this.element).limit === 1 ? (picked.length ? picked[0] : undefined) : picked);
        this.render();
    },
    createElement: function (name, className) {
        var element = document.createElement(name);
        element.className = 'assetpicker-' + className.split(' ').join(' assetpicker-');
        return element;
    },
    render: function () {
        if (!this.container) {
            this.container = this.element.parentNode.insertBefore(this.createElement('div', 'ui'), this.element);
            this.element.parentNode.removeChild(this.element);
        }
        this.container.innerHTML = '';
        this.renderItems(this.picked);
        util[(this.picked.length || this.config.readonly ? 'add' : 'remove') + 'Class'](this.element, 'assetpicker-hidden');
        this.container.appendChild(this.element);

        if (this.picked.length && !this.config.readonly) {
            var limit = this.picker._getPickConfig(this.element).limit;
            if (limit === 0 || limit !== 1 && this.picked.length < limit) {
                this.container.appendChild(this.createElement('span', 'add')).addEventListener('click', function (e) {
                    this.add = true;
                    this.element.setAttribute('data-limit', limit - this.picked.length);
                    this.picker.open(this.element);
                    this.element.setAttribute('data-limit', limit);
                }.bind(this));
            }
        }
    },
    renderItems: function (picked) {
        for (var i = 0, l = picked.length; i < l; i++) {
            var item = this.container.appendChild(this.createElement('div', 'item'));
            var preview = item.appendChild(this.createElement('div', 'preview'));
            var mediaType = extend({name: 'file'}, picked[i].mediaType);
            var fileTypeClass = 'ft ft-' + mediaType.name;
            preview.appendChild(this.createElement('div', fileTypeClass));
            if (mediaType.iconBig) {
                preview.appendChild(this.createElement('div', 'icn')).style.backgroundImage = 'url(' + mediaType.iconBig + ')';
            }
            if (picked[i].thumbnail) {
                preview.appendChild(this.createElement('div', 'tn ' + mediaType.name)).style.backgroundImage = 'url(' + picked[i].thumbnail + ')';
            }
            if (!this.config.readonly) {
                preview.appendChild(this.createDeleteButton(picked[i]));
            }
            var title = item.appendChild(this.createElement('div', 'title'));
            if (mediaType.icon) {
                title.appendChild(this.createElement('img', 'icn')).src = mediaType.icon;
            } else {
                title.appendChild(this.createElement('span', fileTypeClass));
            }
            title.appendChild(document.createTextNode(picked[i].name));
        }
    },
    createDeleteButton: function (item) {
        var button = this.createElement('span', 'del');
        button.addEventListener('click', function () {
            var picked = [];
            for (var i = 0, l = this.picked.length; i < l; i++) {
                if (this.picked[i] !== item) {
                    picked.push(this.picked[i]);
                }
            }
            this.pick(picked);
        }.bind(this));
        return button;
    }
});