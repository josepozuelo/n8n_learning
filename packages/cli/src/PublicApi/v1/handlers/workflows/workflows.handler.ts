import express = require('express');
import { FindManyOptions, In } from 'typeorm';
import { ActiveWorkflowRunner, Db } from '../../../..';
import config = require('../../../../../config');
import { WorkflowEntity } from '../../../../databases/entities/WorkflowEntity';
import { replaceInvalidCredentials } from '../../../../WorkflowHelpers';
import { WorkflowRequest } from '../../../types';
import { authorize, validCursor } from '../../shared/midlewares/global.midleware';
import { encodeNextCursor } from '../../shared/services/pagination.service';
import { getWorkflowOwnerRole, isInstanceOwner } from '../users/users.service';
import {
	getWorkflowById,
	getSharedWorkflow,
	activeWorkflow,
	desactiveWorkflow,
	updateWorkflow,
	hasStartNode,
	getStartNode,
	getWorkflows,
	getSharedWorkflows,
	getWorkflowsCount,
	createWorkflow,
} from './workflows.service';

export = {
	createWorkflow: [
		authorize(['owner', 'member']),
		async (req: WorkflowRequest.Create, res: express.Response): Promise<express.Response> => {
			let workflow = req.body;

			workflow.active = false;

			// if the workflow does not have a start node, add it.
			if (!hasStartNode(workflow)) {
				workflow.nodes.push(getStartNode());
			}

			const role = await getWorkflowOwnerRole();

			await replaceInvalidCredentials(workflow);

			workflow = await createWorkflow(workflow, req.user, role);

			return res.json(workflow);
		},
	],
	deleteWorkflow: [
		authorize(['owner', 'member']),
		async (req: WorkflowRequest.Get, res: express.Response): Promise<express.Response> => {
			const { workflowId } = req.params;

			const sharedWorkflow = await getSharedWorkflow(req.user, workflowId.toString());

			if (!sharedWorkflow) {
				// user trying to access a workflow he does not own
				// or workflow does not exist
				return res.status(404).json();
			}

			const workflowRunner = ActiveWorkflowRunner.getInstance();

			if (sharedWorkflow.workflow.active) {
				// deactivate before deleting
				await workflowRunner.remove(workflowId.toString());
			}

			await Db.collections.Workflow.delete(workflowId);

			return res.json(sharedWorkflow.workflow);
		},
	],
	getWorkflow: [
		authorize(['owner', 'member']),
		async (req: WorkflowRequest.Get, res: express.Response): Promise<express.Response> => {
			const { workflowId } = req.params;

			const sharedWorkflow = await getSharedWorkflow(req.user, workflowId.toString());

			if (!sharedWorkflow) {
				// user trying to access a workflow he does not own
				// or workflow does not exist
				return res.status(404).json();
			}

			return res.json(sharedWorkflow.workflow);
		},
	],
	getWorkflows: [
		authorize(['owner', 'member']),
		validCursor,
		async (req: WorkflowRequest.GetAll, res: express.Response): Promise<express.Response> => {
			const { offset = 0, limit = 100, active = undefined } = req.query;

			let workflows: WorkflowEntity[];
			let count: number;

			const query: FindManyOptions<WorkflowEntity> = {
				skip: offset,
				take: limit,
				where: {
					...(active !== undefined && { active }),
				},
				...(!config.getEnv('workflowTagsDisabled') && { relations: ['tags'] }),
			};

			if (isInstanceOwner(req.user)) {
				workflows = await getWorkflows(query);

				count = await getWorkflowsCount(query);
			} else {
				const shareWorkflows = await getSharedWorkflows(req.user);

				if (!shareWorkflows.length) {
					return res.status(404).json();
				}

				const workflowsIds = shareWorkflows.map((shareWorkflow) => shareWorkflow.workflowId);

				Object.assign(query.where, { id: In(workflowsIds) });

				workflows = await getWorkflows(query);

				count = await getWorkflowsCount(query);
			}

			return res.json({
				data: workflows,
				nextCursor: encodeNextCursor({
					offset,
					limit,
					numberOfTotalRecords: count,
				}),
			});
		},
	],
	updateWorkflow: [
		authorize(['owner', 'member']),
		async (req: WorkflowRequest.Update, res: express.Response): Promise<express.Response> => {
			const { workflowId } = req.params;
			const updateData = new WorkflowEntity();
			Object.assign(updateData, req.body);

			const sharedWorkflow = await getSharedWorkflow(req.user, workflowId.toString());

			if (!sharedWorkflow) {
				// user trying to access a workflow he does not own
				// or workflow does not exist
				return res.status(404).json();
			}

			// if the workflow does not have a start node, add it.
			// else there is nothing you can do in IU
			if (!hasStartNode(updateData)) {
				updateData.nodes.push(getStartNode());
			}

			// check credentials for old format
			await replaceInvalidCredentials(updateData);

			const workflowRunner = ActiveWorkflowRunner.getInstance();

			if (sharedWorkflow.workflow.active) {
				// When workflow gets saved always remove it as the triggers could have been
				// changed and so the changes would not take effect
				await workflowRunner.remove(workflowId.toString());
			}

			await updateWorkflow(sharedWorkflow.workflowId, updateData, req.user);

			if (sharedWorkflow.workflow.active) {
				try {
					await workflowRunner.add(sharedWorkflow.workflowId.toString(), 'update');
				} catch (error) {
					// todo
					// remove the type assertion
					const errorObject = error as unknown as { message: string };
					return res.status(400).json({ error: errorObject.message });
				}
			}

			const updatedWorkflow = await getWorkflowById(sharedWorkflow.workflowId);

			return res.json(updatedWorkflow);
		},
	],
	activateWorkflow: [
		authorize(['owner', 'member']),
		async (req: WorkflowRequest.Activate, res: express.Response): Promise<express.Response> => {
			const { workflowId } = req.params;

			const sharedWorkflow = await getSharedWorkflow(req.user, workflowId.toString());

			if (!sharedWorkflow) {
				// user trying to access a workflow he does not own
				// or workflow does not exist
				return res.status(404).json();
			}

			const workflowRunner = ActiveWorkflowRunner.getInstance();

			if (!sharedWorkflow.workflow.active) {
				try {
					await workflowRunner.add(sharedWorkflow.workflowId.toString(), 'activate');
				} catch (error) {
					// todo
					// remove the type assertion
					const errorObject = error as unknown as { message: string };
					return res.status(400).json({ error: errorObject.message });
				}

				// change the status to active in the DB
				await activeWorkflow(sharedWorkflow.workflow);

				sharedWorkflow.workflow.active = true;

				return res.json(sharedWorkflow.workflow);
			}
			// nothing to do as the wokflow is already active
			return res.json(sharedWorkflow.workflow);
		},
	],
	deactivateWorkflow: [
		authorize(['owner', 'member']),
		async (req: WorkflowRequest.Activate, res: express.Response): Promise<express.Response> => {
			const { workflowId } = req.params;

			const sharedWorkflow = await getSharedWorkflow(req.user, workflowId.toString());

			if (!sharedWorkflow) {
				// user trying to access a workflow he does not own
				// or workflow does not exist
				return res.status(404).json();
			}

			const workflowRunner = ActiveWorkflowRunner.getInstance();

			if (sharedWorkflow.workflow.active) {
				await workflowRunner.remove(sharedWorkflow.workflowId.toString());

				await desactiveWorkflow(sharedWorkflow.workflow);

				sharedWorkflow.workflow.active = false;

				return res.json(sharedWorkflow.workflow);
			}

			// nothing to do as the wokflow is already inactive
			return res.json(sharedWorkflow.workflow);
		},
	],
};