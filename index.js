const childProcess = require('child_process');

class Liquibase {
	constructor(params = {}) {
		const defaultParams = {
			driver: 'org.postgresql.Driver',
			classpath: '.:lib/liquibase.jar:lib/:lib/logback-classic-1.2.3.jar:lib/logback-core-1.2.3.jar:lib/postgresql-42.2.6.jar:lib/slf4j-api-1.7.25.jar:lib/snakeyaml-1.23.jar'
		};
		this.params = Object.assign({}, defaultParams, params);
	}

	get command() {
		let cmd = `java `;
		Object.keys(this.params).forEach(key => {
			if (key === 'liquibase') {
				return;
			}
			const value = this.params[key];
			cmd = `${cmd} --${key}=${value}`;
		});
		cmd = cmd + ' liquibase.integration.commandline.Main'

		return cmd;
	}

	exec(command, options = {}) {
		let child;
		let promise = new Promise((resolve, reject) => {
			child = childProcess
				.exec(command, options, (error, stdout, stderr) => {
					if (error) {
						error.stderr = stderr;
						return reject(error);
					}
					resolve({stdout: stdout});
				});
		});
		promise.child = child;
		return promise;
	}

	run(action = 'update', params = '') {
		return this.exec(`${this.command} ${action} ${params}`);
	}
}

module.exports = params => new Liquibase(params);
