var menu, currentItem, bodyListener = function() {
    if (menu) {
        menu.parentNode.removeChild(menu);
        menu = undefined;
    }
    if (currentItem) {
        currentItem.className = currentItem.className.replace(/(^| )contextmenu( |$)/, '$2');
        currentItem = undefined;
    }
};
document.body.addEventListener('click', bodyListener);
window.addEventListener('blur', bodyListener);
document.body.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    bodyListener();
});

module.exports = {
    created: function() {
        if (!this.$options.contextmenu) {
            throw 'Your component needs to have an option contextmenu';
        }
        if (typeof this.$options.contextmenu !== 'function') {
            throw 'contextmenu option must be a function returning an array';
        }
    },
    methods: {
        contextmenu: function(e) {
            bodyListener();
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            currentItem = this.$el;
            currentItem.className = (currentItem.className ? currentItem.className + ' ' : '') + 'contextmenu';
            menu = this.$root.$el.appendChild(document.createElement('div'));
            menu.id = 'contextmenu';
            var items = this.$options.contextmenu.call(this);
            items.forEach(function(item) {
                var a = menu.appendChild(document.createElement('a'));
                a.innerHTML = item.label;
                if (item.link) {
                    a.setAttribute('href', item.link);
                    a.setAttribute('target', '_blank');
                } else if (item.click) {
                    a.addEventListener('click', function(e) {
                        e.preventDefault();
                        item.click.call(this);
                    }.bind(this));
                }
            }.bind(this));

            var largestWidth = window.innerWidth - menu.offsetWidth - 10,
                largestHeight = window.innerHeight - menu.offsetHeight - 10;

            menu.style.left = Math.min(e.x, largestWidth) + 'px';
            menu.style.top = Math.min(e.y, largestHeight) + 'px';
        }
    }
};
