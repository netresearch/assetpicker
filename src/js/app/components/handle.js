module.exports = {
    template: '<div></div>',
    data: function () {
        return {
            x: undefined
        };
    },
    ready: function () {
        document.body.addEventListener('mousemove', this.drag);
        var parent = this.$el.parentNode, defaultCursor = parent.style.cursor;
        this.$el.addEventListener('mousedown', function (e) {
            parent.style.cursor = 'col-resize';
            var drag = function (e) {
                this.x = e.pageX;
                this.$dispatch('handle-move');
            }.bind(this);
            var leave = function () {
                parent.style.cursor = defaultCursor;
                parent.removeEventListener('mousemove', drag);
                document.body.removeEventListener('mouseleave', leave);
                document.body.removeEventListener('mouseup', leave);
            }.bind(this);
            parent.addEventListener('mousemove', drag);
            document.body.addEventListener('mouseleave', leave);
            document.body.addEventListener('mouseup', leave);
        }.bind(this));
    }
};
