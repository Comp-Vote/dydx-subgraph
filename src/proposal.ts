import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { getUser, getProposal, getProposalVote } from "./helpers";
import {
  ProposalCreated,
  VoteEmitted,
  ProposalCanceled,
  ProposalQueued,
  ProposalExecuted
} from "../generated/DydxGovernor/DydxGovernor"
import { Proposal, ProposalVote, User } from "../generated/schema"

export function handleProposalCreated(event: ProposalCreated): void {
  let proposal: Proposal = getProposal(event.params.id)

  proposal.proposer = getUser(event.params.creator).id
  proposal.values = event.params.values
  proposal.signatures = event.params.signatures
  proposal.calldatas = event.params.calldatas
  proposal.withDelegateCalls = event.params.withDelegatecalls
  proposal.creationBlock = event.block.number
  proposal.creationTime = event.block.timestamp
  proposal.startBlock = event.params.startBlock
  proposal.endBlock = event.params.endBlock
  proposal.strategy = event.params.strategy
  proposal.ipfsHash = event.params.ipfsHash

  proposal.save()
}

export function handleProposalCanceled(event: ProposalCanceled): void {
  let proposal: Proposal = getProposal(event.params.id)

  proposal.cancellationBlock = event.block.number
  proposal.cancellationTime = event.block.timestamp

  proposal.save()
}

export function handleProposalQueued(event: ProposalQueued): void {
  let proposal: Proposal = getProposal(event.params.id)

  proposal.executionETA = event.params.executionTime
  proposal.queuedBlock = event.block.number
  proposal.queuedTime = event.block.timestamp

  proposal.save()
}

export function handleProposalExecuted(event: ProposalExecuted): void {
  let proposal: Proposal = getProposal(event.params.id)

  proposal.executionETA = null;
  proposal.executionBlock = event.block.number
  proposal.executionTime = event.block.timestamp

  proposal.save()
}

export function handleVoteEmitted(event: VoteEmitted): void {
  let userAddress: Address = event.params.voter
  let proposalId: BigInt = event.params.id
  let proposalVote: ProposalVote = getProposalVote(proposalId, userAddress)

  proposalVote.user = getUser(userAddress).id
  proposalVote.proposal = getProposal(proposalId).id
  proposalVote.support = event.params.support
  proposalVote.votingPower = event.params.votingPower

  proposalVote.save()

  let user: User = getUser(event.params.voter)
  user.numberVotes = user.numberVotes + 1
  user.save()
}
