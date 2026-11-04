import { parseServerSentEvents } from './server-sent-events';

describe('parseServerSentEvents', () => {
  it('returns complete events and keeps the unfinished rest', () => {
    const { events, rest } = parseServerSentEvents('event:table\ndata:{"a":1}\n\nevent:table\ndata:{"a"');
    expect(events).toEqual([{ event: 'table', data: '{"a":1}' }]);
    expect(rest).toBe('event:table\ndata:{"a"');
  });

  it('handles CRLF, a space after the colon, multi-line data and comments', () => {
    const { events, rest } = parseServerSentEvents(': keep-alive\r\n\r\nevent: table\r\ndata: one\r\ndata: two\r\n\r\n');
    expect(events).toEqual([{ event: 'table', data: 'one\ntwo' }]);
    expect(rest).toBe('');
  });

  it('names an event without a name "message"', () => {
    expect(parseServerSentEvents('data:x\n\n').events).toEqual([{ event: 'message', data: 'x' }]);
  });
});
