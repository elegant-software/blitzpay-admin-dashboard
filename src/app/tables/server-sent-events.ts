export interface ServerSentEvent {
  event: string;
  data: string;
}

/**
 * Splits text received so far from a `text/event-stream` into complete events and the unfinished rest, which is
 * kept for the next chunk. Comment lines (": keep-alive") are ignored; an event without a name is "message".
 */
export function parseServerSentEvents(buffer: string): { events: ServerSentEvent[]; rest: string } {
  const normalized = buffer.replace(/\r\n?/g, '\n');
  const blocks = normalized.split('\n\n');
  const rest = blocks.pop() ?? '';
  const events: ServerSentEvent[] = [];
  for (const block of blocks) {
    let event = 'message';
    const data: string[] = [];
    for (const line of block.split('\n')) {
      if (!line || line.startsWith(':')) continue;
      const colon = line.indexOf(':');
      const field = colon === -1 ? line : line.slice(0, colon);
      const value = colon === -1 ? '' : line.slice(colon + 1).replace(/^ /, '');
      if (field === 'event') event = value;
      else if (field === 'data') data.push(value);
    }
    if (data.length) events.push({ event, data: data.join('\n') });
  }
  return { events, rest };
}
