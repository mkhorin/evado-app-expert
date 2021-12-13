'use strict';

const front = new Vue({
    el: '#front',
    props: {
        csrf: String,
        dataUrl: String,
        thumbnailUrl: String
    },
    propsData: {
        ...document.querySelector('#front').dataset
    },
    data () {
        return {
            questions: [],
            results: null
        };
    },
    computed: {
        empty () {
            return this.questions?.length === 0;
        }
    },
    async created () {
        const question = await this.loadFirstQuestion();
        if (question) {
            this.questions.push(question);
        }
    },
    methods: {
        onBackQuestion () {
            if (this.results) {
                this.getLastQuestion().activate();
                this.results = null;
            } else {
                this.getSecondLastQuestion().activate();
                this.questions.splice(-1, 1);
            }
        },
        async onSubmitQuestion (value) {
            const {question, message, result} = await this.loadNextQuestion();
            if (question) {
                this.questions.push(question);
            } else {
                this.results = result ? this.formatResults(result) : message;
            }
        },
        loadFirstQuestion () {
            return this.fetchJson('first-question');
        },
        loadNextQuestion () {
            return this.fetchJson('next-question', {
                answers: this.getAnswers(),
                questions: this.getRefQuestions().map(ref => ref.id)
            });
        },
        getAnswers () {
            let result = [];
            for (let ref of this.getRefQuestions()) {
                result = result.concat(ref.value);
            }
            return result;
        },
        getLastQuestion () {
            return this.getRefQuestion(this.questions.length - 1);
        },
        getSecondLastQuestion () {
            return this.getRefQuestion(this.questions.length - 2);
        },
        getRefQuestion (index) {
            return this.getRefQuestions()[index];
        },
        getRefQuestions () {
            return this.getRefArray('question');
        },
        formatResults (items) {
            return items.map(item => ({
                name: Jam.t(item.name, 'meta.class.entity'),
                url: this.getThumbnailUrl(item.picture)
            }));
        }
    }
});