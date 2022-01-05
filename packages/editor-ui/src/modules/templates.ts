import { getTemplates } from '@/api/templates';
import { ActionContext, Module } from 'vuex';
import {
	IRootState,
	IN8nTemplate,
	ITemplateState,
	ISearchPayload,
	ISearchResults,
	ITemplateCategory,
	ITemplateCollection,
} from '../Interface';
import Vue from 'vue';

const module: Module<ITemplateState, IRootState> = {
	namespaced: true,
	state: {
		template: {},
		categories: [],
		collections: [],
	},
	getters: {
		getTemplate(state: ITemplateState) {
			return state.template;
		},
		getCategories(state: ITemplateState) {
			return state.categories;
		},
		getCollections(state: ITemplateState) {
			return state.collections;
		},
	},
	mutations: {
		setTemplate(state: ITemplateState, template: IN8nTemplate) {
			Vue.set(state, 'template', template);
		},
		setCategories(state: ITemplateState, categories: ITemplateCategory[]) {
			Vue.set(state, 'categories', categories);
		},
		setCollections(state: ITemplateState, collections: ITemplateCollection[]) {
			Vue.set(state, 'collections', collections);
		},
	},
	actions: {
		async getSearchResults(context: ActionContext<ITemplateState, IRootState>, templateId: string) {
			try {
				const payload: ISearchPayload = await getTemplates(10, 0, null, null);
				const results : ISearchResults = payload.data;
				const categories = results.categories.map((category: ITemplateCategory) => {
					category.selected = false;
					return category;
				});
				context.commit('setCategories', categories);
				context.commit('setCollections', results.collections);
				return results;
			} catch(e) {
				return;
			}
		},
	},
};

export default module;