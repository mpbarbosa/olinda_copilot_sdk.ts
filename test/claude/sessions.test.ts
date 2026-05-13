import {
	deleteClaudeSession,
	getClaudeSessionInfo,
	getClaudeSessionMessages,
	listClaudeSessions,
	renameClaudeSession,
} from '../../src/claude/sessions';

const mockListSessions = jest.fn();
const mockGetSessionInfo = jest.fn();
const mockDeleteSession = jest.fn();
const mockRenameSession = jest.fn();
const mockGetSessionMessages = jest.fn();

jest.mock('@anthropic-ai/claude-agent-sdk', () => ({
	listSessions: (...args: unknown[]) => mockListSessions(...args),
	getSessionInfo: (...args: unknown[]) => mockGetSessionInfo(...args),
	deleteSession: (...args: unknown[]) => mockDeleteSession(...args),
	renameSession: (...args: unknown[]) => mockRenameSession(...args),
	getSessionMessages: (...args: unknown[]) => mockGetSessionMessages(...args),
}));

const sessionId = 'sess-00000000';

describe('Claude session helpers', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockListSessions.mockResolvedValue([
			{
				sessionId,
				summary: 'Demo session',
				lastModified: 100,
				cwd: '/tmp/project',
				createdAt: 50,
			},
		]);
		mockGetSessionInfo.mockResolvedValue({
			sessionId,
			summary: 'Demo session',
			lastModified: 100,
			cwd: '/tmp/project',
			createdAt: 50,
		});
		mockDeleteSession.mockResolvedValue(undefined);
		mockRenameSession.mockResolvedValue(undefined);
		mockGetSessionMessages.mockResolvedValue([
			{
				type: 'assistant',
				uuid: 'msg-1',
				session_id: sessionId,
				message: { text: 'hello' },
				parent_tool_use_id: null,
			},
		]);
	});

	it('maps session summaries when listing sessions', async () => {
		const sessions = await listClaudeSessions({ dir: '/tmp/project', limit: 5 });
		expect(mockListSessions).toHaveBeenCalledWith({ dir: '/tmp/project', limit: 5, offset: undefined, includeWorktrees: undefined });
		expect(sessions).toEqual([
			{
				sessionId,
				summary: 'Demo session',
				lastModified: 100,
				cwd: '/tmp/project',
				createdAt: 50,
			},
		]);
	});

	it('maps a single session summary', async () => {
		const session = await getClaudeSessionInfo(sessionId, { dir: '/tmp/project' });
		expect(mockGetSessionInfo).toHaveBeenCalledWith(sessionId, { dir: '/tmp/project' });
		expect(session?.sessionId).toBe(sessionId);
	});

	it('delegates delete through the compat adapter', async () => {
		await deleteClaudeSession(sessionId, { dir: '/tmp/project' });
		expect(mockDeleteSession).toHaveBeenCalledWith(sessionId, { dir: '/tmp/project' });
	});

	it('delegates rename through the Claude SDK', async () => {
		await renameClaudeSession(sessionId, 'New title', { dir: '/tmp/project' });
		expect(mockRenameSession).toHaveBeenCalledWith(sessionId, 'New title', { dir: '/tmp/project' });
	});

	it('maps transcript messages into the library-owned shape', async () => {
		const messages = await getClaudeSessionMessages(sessionId, { dir: '/tmp/project', limit: 10 });
		expect(mockGetSessionMessages).toHaveBeenCalledWith(
			sessionId,
			{ dir: '/tmp/project', limit: 10, offset: undefined, includeSystemMessages: undefined },
		);
		expect(messages).toEqual([
			{
				type: 'assistant',
				id: 'msg-1',
				sessionId,
				content: { text: 'hello' },
				parentToolUseId: null,
			},
		]);
	});
});
