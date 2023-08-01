import { getRuleInfo, getBridgeInfo } from '@/api/ruleengine'
import { Edge, Node } from '@vue-flow/core'
import { Ref, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import useFlowUtils from './useFlowUtils'
import { RuleItem } from '@/types/rule'
import useFlowNode, { NodeType } from './useFlowNode'

export default () => {
  const route = useRoute()

  const flowId = computed(() => route.params.id.toString())
  let ruleData: undefined | RuleItem = undefined
  // let bridgeInfoMap = {}
  const flowData: Ref<undefined | Array<Node | Edge>> = ref(undefined)

  const getRuleData = async () => {
    try {
      ruleData = await getRuleInfo(flowId.value)
      return Promise.resolve()
    } catch (error) {
      console.error(error)
      return Promise.reject()
    }
  }

  const { generateFlowDataFromRuleItem } = useFlowUtils()
  const { isBridgerNode } = useFlowNode()
  const getFlowData = async () => {
    if (!ruleData) {
      return
    }
    const { nodes, edges } = generateFlowDataFromRuleItem(ruleData)
    const sourceAndSinkNodes = [...nodes[NodeType.Source], ...nodes[NodeType.Sink]]
    const bridgeArr = await Promise.allSettled(
      sourceAndSinkNodes
        .filter((item) => isBridgerNode(item))
        .map(({ id: nodeId }) => {
          const bridgeId = nodeId.split('-')[1]
          return getBridgeInfo(bridgeId)
        }),
    )

  }

  const initData = async () => {
    try {
      await getRuleData()
    } catch (error) {
      //
    }
  }

  if (flowId.value) {
    initData
  }

  return {
    flowId,
    flowData,
  }
}
