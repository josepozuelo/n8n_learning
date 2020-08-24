import {
	INodeProperties,
} from 'n8n-workflow';

export const loadBalancerOperations = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: {
			show: {
				resource: [
					'loadBalancer',
				],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a load balancer',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a load balancer',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a load balancer',
			},
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all load balancers',
			},
		],
		default: 'create',
		description: 'The operation to perform.',
	},
] as INodeProperties[];

export const loadBalancerFields = [

	/* -------------------------------------------------------------------------- */
	/*                                  loadBalancer:create                       */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'IP Address Type',
		name: 'ipAddressType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'loadBalancer',
				],
				operation: [
					'create',
				],
			},
		},
		options: [
			{
				name: 'ipv4',
				value: 'ipv4',
			},
			{
				name: 'dualstack',
				value: 'dualstack',
			},
		],
		default: 'ipv4',
		description: 'The type of IP addresses used by the subnets for your load balancer',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'loadBalancer',
				],
				operation: [
					'create',
				],
			},
		},
		default: '',
		description: 'This name must be unique per region per account, can have a maximum of 32 characters',
	},
	{
		displayName: 'Schema',
		name: 'schema',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'loadBalancer',
				],
				operation: [
					'create',
				],
			},
		},
		options: [
			{
				name: 'Internal',
				value: 'internal',
			},
			{
				name: 'Internet Facing',
				value: 'internet-facing',
			},
		],
		default: 'internet-facing',
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'loadBalancer',
				],
				operation: [
					'create',
				],
			},
		},
		options: [
			{
				name: 'Application',
				value: 'application',
			},
			{
				name: 'Network',
				value: 'network',
			},
		],
		default: 'application',
	},
	{
		displayName: 'Subnet IDs',
		name: 'subnets',
		type: 'multiOptions',
		displayOptions: {
			show: {
				resource: [
					'loadBalancer',
				],
				operation: [
					'create',
				],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getSubnets',
		},
		required: true,
		default: [],
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				operation: [
					'create',
				],
				resource: [
					'loadBalancer',
				],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Security Group IDs',
				name: 'securityGroups',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getSecurityGroups',
				},
				default: [],
			},
			{
				displayName: 'Tags',
				name: 'tagsUi',
				placeholder: 'Add Tag',
				type: 'fixedCollection',
				default: '',
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'tagValues',
						displayName: 'Tag',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
								description: 'The key of the tag',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'The value of the tag',
							},
						],
					},
				],
			},
		],
	},

	/* -------------------------------------------------------------------------- */
	/*                                  loadBalancer:get                          */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Load Balancer ARN',
		name: 'loadBalancerId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'loadBalancer',
				],
				operation: [
					'get',
				],
			},
		},
		default: '',
		description: 'Unique identifier for a particular loadBalancer',
	},

	/* -------------------------------------------------------------------------- */
	/*                                  loadBalancer:getAll                       */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: [
					'loadBalancer',
				],
				operation: [
					'getAll',
				],
			},
		},
		default: false,
		description: 'If all results should be returned or only up to a given limit.',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 100,
		typeOptions: {
			maxValue: 400,
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: [
					'loadBalancer',
				],
				operation: [
					'getAll',
				],
				returnAll: [
					false,
				],
			},
		}
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				operation: [
					'getAll',
				],
				resource: [
					'loadBalancer',
				],
				returnAll: [
					true,
				],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Names',
				name: 'names',
				type: 'string',
				default: '',
				description: 'The names of the load balancers. Multiples can be defined separated by comma.',
			},
		],
	},

	/* -------------------------------------------------------------------------- */
	/*                                  loadBalancer:delete                       */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Load Balancer ARN',
		name: 'loadBalancerId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'loadBalancer',
				],
				operation: [
					'delete',
				],
			},
		},
		default: '',
		description: 'ID of loadBalancer to delete',
	},
] as INodeProperties[];
