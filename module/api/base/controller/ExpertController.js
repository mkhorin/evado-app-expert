/**
 * @copyright Copyright (c) 2020 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('evado-api-base/component/BaseController');

module.exports = class ExpertController extends Base {

    async actionFirstQuestion () {
        const metaClass = this.getMetaClass('question');
        const metaView = this.getMetaView('publicList', metaClass);
        const query = metaView.createQuery(this.getSpawnConfig());
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
        const answerIds = this.getPostParam('answers');
        const questionIds = this.getPostParam('questions');
        if (!Array.isArray(answerIds) || !Array.isArray(questionIds)) {
            throw new BadRequest;
        }
        const answerClass = this.baseMeta.getClass('answer');
        const questionClass = this.baseMeta.getClass('question');
        const entityClass = this.baseMeta.getClass('entity');
        const answers = await answerClass.findById(answerIds).raw().all();
        const includedAttrs = this.getAnswerAttrs(answers, false);
        const excludedAttrs = this.getAnswerAttrs(answers, true);
        const condition = includedAttrs.map(id => ({attributes: id}));
        if (excludedAttrs.length) {
            condition.push(['NOT IN', 'attributes', excludedAttrs]);
        }
        const entities = await entityClass.find(...condition).raw().all();
        if (!entities.length) {
            return this.sendJson({message: 'No matching entities'});
        }
        if (entities.length === 1) {
            return this.sendResult(entities, entityClass);
        }
        const entityAttrs = [].concat(...ArrayHelper.getPropertyValues('attributes', entities));
        const newAttrs = MongoHelper.diff(entityAttrs, includedAttrs);
        if (!newAttrs.length) {
            return this.sendResult(entities, entityClass);
        }
        const newAnswers = await answerClass.find({attributes: newAttrs}).ids();
        const newQuestions = await questionClass.find()
            .and({active: true, answers: newAnswers})
            .and(['NOT ID', questionClass.getKey(), questionIds]).ids();
        if (!newQuestions.length) {
            return this.sendResult(entities, entityClass);
        }
        const id = ArrayHelper.getRandom(newQuestions);
        const model = await questionClass.getView('publicList').findById(id).withReadData().one();
        this.sendJson({question: model.output()});
    }

    getAnswerAttrs (answers, except) {
        answers = answers.filter(data => data.except === except);
        return [].concat(...ArrayHelper.getPropertyValues('attributes', answers))
    }

    async sendResult (entities, entityClass) {
        const ids = entities.map(data => data[entityClass.getKey()]);
        const models = await entityClass.getView('publicList').findById(ids).all();
        this.sendJson({result: models.map(model => model.output())});
    }
};
module.exports.init(module);

const BadRequest = require('areto/error/http/BadRequest');
const NotFound = require('areto/error/http/NotFound');
const MathHelper = require('areto/helper/MathHelper');
const ArrayHelper = require('areto/helper/ArrayHelper');
const MongoHelper = require('areto/helper/MongoHelper');