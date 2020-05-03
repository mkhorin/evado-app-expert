'use strict';

Front.Expert = class Expert extends Front.Element {

    init () {
        this.$questions = this.find('.questions');
        this.$questions.on('click', '[data-action="submit"]', this.onSubmit.bind(this));
        this.$questions.on('click', '[data-action="back"]', this.onBack.bind(this));
        this.$questions.on('change', 'input', this.onChangeAnswer.bind(this));
        this.loadFirstQuestion();
    }

    getUrl (action) {
        return this.front.getData('expertUrl') + action;
    }

    hideLoader () {
        this.front.toggleLoader(false);
    }

    showLoader () {
        this.front.toggleLoader(true);
    }

    getQuestion (element) {
        return $(element).closest('.question');
    }

    getQuestions () {
        return this.$questions.children();
    }

    loadFirstQuestion () {
        this.showLoader();
        this.front.ajaxQueue.post(this.getUrl('first-question'))
            .then(this.onFirstQuestion.bind(this))
            .fail(this.onFail.bind(this));
    }

    onFirstQuestion (data) {
        this.hideLoader();
        this.createQuestion(data);
    }

    loadNextQuestion () {
        this.showLoader();
        this.disableQuestions();
        const questions = $.map(this.getQuestions(), item => item.dataset.id);
        const answers = $.map(this.$questions.find(':checked'), item => item.value);
        this.front.ajaxQueue.post(this.getUrl('next-question'), {questions, answers})
            .then(this.onNextQuestion.bind(this))
            .fail(this.onFail.bind(this));
    }

    onNextQuestion (data) {
        this.hideLoader();
        if (data.question) {
            return this.createQuestion(data.question);
        }
        if (data.message) {
            const text = Jam.i18n.translate(data.message);
            return this.$questions.append(this.resolveTemplate('message', {text}));
        }
        if (data.result) {
            return this.createResult(data.result)
        }
        this.createError('Unexpected response')
    }

    onFail (data) {
        this.hideLoader();
        this.createError(`${data.statusText}: ${data.responseText}`);
    }

    createError (text) {
        text = Jam.i18n.translate(text);
        this.$container.append(this.resolveTemplate('error', {text}));
    }

    createQuestion (data) {
        data.answers = data.answers.map(item => this.createAnswer(item, data)).join('');
        this.$questions.append(this.resolveTemplate('question', data));
        this.translateContainer();
    }

    createAnswer (data, question) {
        data.name = question._id;
        const template = question.multiple ? 'checkItem' : 'radioItem';
        return this.resolveTemplate(template, data)
    }

    onSubmit (event) {
        const $question = this.getQuestion(event.currentTarget);
        this.loadNextQuestion();
    }

    onBack (event) {
        this.getQuestion(event.currentTarget).remove();
        this.enableLastQuestion();
    }

    onChangeAnswer (event) {
        const $question = this.getQuestion(event.currentTarget);
        $question.toggleClass('answered', $question.find(':checked').length > 0);
    }

    enableLastQuestion () {
        this.$questions.children().last().find('input').removeAttr('disabled')
            .closest('label').removeClass('disabled');
    }

    disableQuestions () {
        this.$questions.find('input').attr('disabled', true)
            .closest('label').addClass('disabled');
    }

    createResult (items) {
        items = items.map(this.createEntity, this).join('');
        this.$questions.append(this.resolveTemplate('result', {items}));
        this.translateContainer();
        Jam.Helper.executeSerialImageLoading($(this.container));
    }

    createEntity (data) {
        return this.resolveTemplate('entity', data);
    }
};