'use strict';

Vue.component('question', {
    props: {
        index: Number,
        item: Object
    },
    data () {
        const {item} = this;
        return {
            id: item._id,
            text: Jam.t(item.text, 'meta.class.question'),
            multiple: item.multiple,
            answers: item.answers,
            value: null,
            active: true
        };
    },
    computed: {
        empty () {
            return this.multiple ? !this.value.length : !this.value;
        },
        first () {
            return this.index === 0;
        }
    },
    async created () {
        this.answers = this.formatAnswers(this.answers);
        this.value = this.multiple ? [] : null;
    },
    methods: {
        onBack () {
            this.$emit('back');
        },
        onSubmit () {
            this.active = false;
            this.$emit('submit', this.value);
        },
        activate () {
            this.active = true;
        },
        formatAnswers (items) {
            return items.map(item => ({
                id: item._id,
                text: Jam.t(item.text, 'meta.class.answer'),
                type: this.multiple ? 'checkbox' : 'radio',
                uid: this.getRandomId()
            }));
        }
    },
    template: '#question'
});