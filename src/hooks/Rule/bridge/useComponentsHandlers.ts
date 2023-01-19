import { REDIS_TYPE, MONGO_TYPE } from '@/common/constants'
import useI18nTl from '@/hooks/useI18nTl'
import { SchemaRules } from '@/hooks/useSchemaFormRules'
import { Properties } from '@/types/schemaForm'
import useSpecialRuleForPassword from '@/hooks/Rule/bridge/useSpecialRuleForPassword'

/**
 * Sometimes it is necessary to make some custom changes to the components used by the schema form component,
 * such as adding a secondary type selection,
 * or changing the type of a form item if the data given by the backend is incorrect,
 * etc. This can be defined here.
 */
export default (props: any) => {
  const { t } = useI18nTl('RuleEngine')

  const deleteSSLLabelAndDesc = (components: Properties) => {
    if (components.ssl) {
      components.ssl.description = ''
      components.ssl.label = ''
    }
    return components
  }

  const { ruleWhenTestConnection } = useSpecialRuleForPassword(props)
  const addRuleForPassword = (rules: any) => {
    // TODO:consider the path
    if (!rules.password) {
      rules.password = []
    }
    if (Array.isArray(rules.password)) {
      rules.password.push(...ruleWhenTestConnection)
    }
    return rules
  }

  const commonHandler = ({ components, rules }: { components: Properties; rules: SchemaRules }) => {
    const comRet = deleteSSLLabelAndDesc(components)
    const rulesRet = addRuleForPassword(rules)
    return { components: comRet, rules: rulesRet }
  }

  const redisComponentsHandler = (data: { components: Properties; rules: SchemaRules }) => {
    const { components, rules } = commonHandler(data)
    const { redis_type, servers, command_template } = components
    if (redis_type?.symbols && Array.isArray(redis_type.symbols)) {
      redis_type.symbols = REDIS_TYPE
      redis_type.label = t('Auth.redisType')
      redis_type.componentProps = { clearable: false }
      if (redis_type.description) {
        Reflect.deleteProperty(redis_type, 'description')
      }
    }
    if (redis_type?.symbols && Array.isArray(redis_type.symbols)) {
      redis_type.symbols = REDIS_TYPE
    }
    if (
      servers?.type === 'string' ||
      (servers?.type === 'array' && servers?.items?.type === 'string')
    ) {
      servers.type = 'string'
      servers.componentProps = {
        type: 'textarea',
        rows: 3,
      }
    }
    if (command_template?.type === 'array' && command_template?.items?.type === 'string') {
      command_template.type = 'string'
      command_template.format = 'sql'
      command_template.default = ''
    }
    return { components, rules }
  }

  const mongoComponentsHandler = (data: { components: Properties; rules: SchemaRules }) => {
    const { components, rules } = commonHandler(data)
    const { mongo_type, payload_template, servers } = components
    if (mongo_type?.symbols && Array.isArray(mongo_type.symbols)) {
      mongo_type.symbols = MONGO_TYPE
      mongo_type.label = t('Auth.mongoType')
      mongo_type.componentProps = { clearable: false }
      if (mongo_type.description) {
        Reflect.deleteProperty(mongo_type, 'description')
      }
    }
    if (payload_template?.type === 'string') {
      payload_template.format = 'sql'
    }
    if (
      servers?.type === 'string' ||
      (servers?.type === 'array' && servers?.items?.type === 'string')
    ) {
      servers.type = 'string'
      servers.componentProps = {
        type: 'textarea',
        rows: 3,
      }
    }

    return { components, rules }
  }

  const GCPComponentsHandler = (data: { components: Properties; rules: SchemaRules }) => {
    const { components, rules } = commonHandler(data)
    const { service_account_json, payload_template } = components
    if (service_account_json?.type === 'string') {
      // The backend does not give data indicating that it is possible to upload files here, add it manually
      service_account_json.format = 'file'
      service_account_json.componentProps = {
        accept: '.json',
        tip: t('Base.uploadTip', { format: '.json' }),
      }
    }
    if (payload_template?.type === 'string') {
      payload_template.format = 'sql'
    }
    return { components, rules }
  }

  return {
    commonHandler,
    redisComponentsHandler,
    mongoComponentsHandler,
    GCPComponentsHandler,
  }
}