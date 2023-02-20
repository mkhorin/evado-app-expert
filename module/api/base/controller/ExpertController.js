/**
 * @copyright Copyright (c) 2020 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('evado-api-base/component/BaseController');

module.exports = class ExpertController extends Base {

    async actionFirstQuestion () {
        const cls = this.getMetadataClass('question');
        const view = this.getMetadataView('publicList', cls);
        const config = this.getSpawnConfig();
        const query = view.createQuery(config);
        const counter = await query.count();
        if (!counter) {
            throw new NotFound('First question no found');
        }
        const index = MathHelper.random(0, counter - 1);
        const model = await query.offset(index).withReadData().one();
        if (!model) {
            throw new NotFound('First question no found');
        }
        this.sendJson(model.output());
    }

    async actionNextQuestion () {
        const {answers: answerIds, questions: questionIds} = this.getPostParams();
        if (!Array.isArray(answerIds) || !Array.isArray(questionIds)) {
            throw new BadRequest;
        }
        const answerClass = this.baseMeta.getClass('answer');
        const questionClass = this.baseMeta.getClass('question');
        const entityClass = this.baseMeta.getClass('entity');
        const answerQuery = answerClass.findById(answerIds).raw();
        const answers = await answerQuery.all();
        const includedAttrs = this.getAnswerAttrs(answers, false);
        const excludedAttrs = this.getAnswerAttrs(answers, true);
        const condition = includedAttrs.map(id => ({attributes: id}));
        if (excludedAttrs.length) {
            condition.push(['notIn', 'attributes', excludedAttrs]);
        }
        const entityQuery = entityClass.find(...condition).raw();
        const entities = await entityQuery.all();
        if (!entities.length) {
            return this.sendJson({message: 'No matching entities'});
        }
        if (entities.length === 1) {
            return this.sendResult(entities, entityClass);
        }
        const entityValues = ArrayHelper.getPropertyValues('attributes', entities);
        const entityAttrs = [].concat(...entityValues);
        const newAttrs = MongoHelper.diff(entityAttrs, includedAttrs);
        if (!newAttrs.length) {
            return this.sendResult(entities, entityClass);
        }
        const newAnswers = await answerClass.find({attributes: newAttrs}).ids();
        const questionQuery = questionClass.find()
            .and({active: true, answers: newAnswers})
            .and(['notId', questionClass.getKey(), questionIds]);
        const newQuestions = await questionQuery.ids();
        if (!newQuestions.length) {
            return this.sendResult(entities, entityClass);
        }
        const id = ArrayHelper.random(newQuestions);
        const view = questionClass.getView('publicList');
        const model = await view.findById(id).withReadData().one();
        const question = model.output();
        this.sendJson({question});
    }

    getAnswerAttrs (answers, except) {
        answers = answers.filter(data => data.except === except);
        const values = ArrayHelper.getPropertyValues('attributes', answers);
        return [].concat(...values);
    }

    async sendResult (entities, entityClass) {
        const ids = entities.map(data => data[entityClass.getKey()]);
        const view = entityClass.getView('publicList');
        const models = await view.findById(ids).all();
        const result = models.map(model => model.output());
        this.sendJson({result});
    }
};
module.exports.init(module);

const BadRequest = require('areto/error/http/BadRequest');
const NotFound = require('areto/error/http/NotFound');
const MathHelper = require('areto/helper/MathHelper');
const ArrayHelper = require('areto/helper/ArrayHelper');
const MongoHelper = require('areto/helper/MongoHelper');