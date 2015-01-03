/**
 * The following is a mapping of the data objects that Redmix supports
 */
module.exports = {
	acls: {
		supports_custom: false,
		fields: {
			name: {
				description:'Name of the ACL object',
				required: true
			},
			public_read: {
				description: 'Determines whether objects controlled by this ACS are publicly readable',
				required: false
			},
			public_write: {
				description: 'Determines whether objects controlled by this ACS are publicly writable',
				required: false
			},
			reader_ids: {
				description: 'List of IDs identifying users who can read objects controlled by this ACL',
				array: true,
				required: false
			},
			writer_ids: {
				description: 'List of IDs identifying users who can update objects controlled by this ACL',
				array: true,
				required: false
			},
			user: {
				description: 'Owner of the ACL',
				required: false
			}
		}
	},
	files: {
		supports_custom: true,
		fields: {
			name: {
				description: 'File name',
				required: true
			},
			user: {
				description: 'Owner of the File',
				required: false
			},
			file: {
				description: 'The file path',
				required: true,
				path: true
			}
		}
	},
	keyvalues: {
		create: 'set',
		supports_custom: false,
		fields: {
			name: {
				description: 'Name (or key) for this key-value pair',
				required: true
			},
			type: {
				description: 'Value type: "string" or "binary"',
				required: false
			},
			value: {
				description: 'String or binary data',
				required: true
			}
		}
	},
	users: {
		supports_custom: true,
		fields: {
			email: {
				description: "User's email address. Required if username is not specified",
				required: true,
				required_if_missing: 'username'
			},
			username: {
				description: "If username is not specified, email, first_name, and last_name must be included",
				required: true,
				required_if_missing: 'email'
			},
			password: {
				description: "User's password",
				required: true
			},
			password_confirmation: {
				description: "Copy of user's password for confirmation",
				required: true,
				copy_if_missing: 'password'
			},
			first_name: {
				description:"User's first name. Required when username is not provided",
				required_if_missing: 'username'
			},
			last_name: {
				description: "User's last name. Required when username is not provided",
				required_if_missing: 'username'
			},
			photo: {
				description: 'New photo to attach as the primary photo for the user',
				path: true
			},
			photo_id: {
				description: 'ID of an existing photo to attach as the primary photo for the user'
			},
			tags: {
				description: 'Comma separated list of tags for this user'
			},
			acl_name: {
				description: 'Name of an ACLs to associate with this object'
			},
			acl_id: {
				description: 'ID of an ACLs to associate with this object'
			},
			role: {
				description: 'String representation of user role, for example, "teacher"'
			},
			template: {
				description: 'Send a congratulation email to notify that the user has been created successfully. You need to create an email template and pass the template name.'
			},
			confirmation_template: {
				description: 'If "New User Email Verification" is enabled for the application, ACS sends a confirmation email to the user. If you don\'t pass the confirmation_template parameter, then ACS sends a default confirmation email.'
			}
		}
	},
	photos: {
		supports_custom: true,
		fields: {
			photo: {
				description: 'The file path to upload',
				path: true,
				required: true
			},
			title: {
				description: 'Photo title',
				required: false
			},
			collection_name: {
				description: 'Name of the PhotoCollections to add this photo to',
				required: false
			},
			collection_id: {
				description: 'ID of the PhotoCollections to add this photo to',
				required: false
			},
			tags: {
				description: 'Comma separated list of tags to associate with this photo',
				required: false
			},
			acl_name: {
				description: 'Name of an ACLs to associate with this object',
				required: false
			},
			acl_id: {
				description: 'ID of an ACLs to associate with this object',
				required: false
			},
			user: {
				description: 'User ID to create the photo on behalf of',
				required: false
			},
			photo_sizes: {
				description: 'User-defined photo sizes',
				required: false
			},
			photo_sync_sizes: {
				description: 'Synchronous photo sizes to upload',
				required: false
			}
		}
	},
	geofences: {
	},
	pushschedules: {
	},
	pushnotifications: {
	}
};
