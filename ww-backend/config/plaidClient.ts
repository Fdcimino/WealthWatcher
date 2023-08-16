
import { Configuration, PlaidApi, PlaidEnvironments} from 'plaid';



let plaidEnviroment = PlaidEnvironments.sandbox;

switch (process.env.PLAID_ENV) {
    case "dev":
        plaidEnviroment = PlaidEnvironments.development;
        break;
    case "prod":
        plaidEnviroment = PlaidEnvironments.production;
        break;
    default:
        plaidEnviroment = PlaidEnvironments.sandbox;

}

const configuration = new Configuration({
    basePath: plaidEnviroment,
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
        },
    },
});

export const client = new PlaidApi(configuration);


