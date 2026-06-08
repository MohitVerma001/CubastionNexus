/**
 * Generate the next ticket ID in the format CUB-00001, CUB-00002, …
 *
 * The query function is injected so the call can participate in a transaction:
 *   const id = await generateTicketId(client.query.bind(client));
 *
 * @param {Function} queryFn  Parameterised query function: (sql, params?) => Promise<{rows}>
 * @returns {Promise<string>} e.g. "CUB-00042"
 */
const generateTicketId = async (queryFn) => {
  const result = await queryFn(
    `SELECT COALESCE(
       MAX(CAST(SUBSTRING(ticket_number FROM 5) AS INTEGER)),
       0
     ) AS max_num
     FROM tickets
     WHERE ticket_number ~ '^CUB-[0-9]{5}$'`
  );

  const maxNum = parseInt(result.rows[0].max_num, 10) || 0;
  const nextNum = maxNum + 1;

  if (nextNum > 99999) {
    throw new Error('Ticket ID sequence exhausted: max CUB-99999 reached');
  }

  return `CUB-${String(nextNum).padStart(5, '0')}`;
};

module.exports = { generateTicketId };
