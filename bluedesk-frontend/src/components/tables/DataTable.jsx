import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Typography, Box, Skeleton } from '@mui/material';

export default function DataTable({ columns, data, page, rowsPerPage, total, onPageChange, onRowsPerPageChange, loading }) {
  return (
    <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key} sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary', py: 2 }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No data available</Typography>
                </TableCell>
              </TableRow>
            ) : loading && data.length === 0 ? null : (
              data.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  sx={{ '&:hover': { bgcolor: 'action.hover' }, '&:last-child td': { border: 0 } }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} sx={{ py: 1.5, fontSize: 13 }}>
                      {col.render ? col.render(row) : row[col.key] ?? '—'}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {loading && data.length === 0 && (
        <Box sx={{ p: 3 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rectangular" height={36} sx={{ mb: 1, borderRadius: 1 }} />
          ))}
        </Box>
      )}
      {total > 0 && (
        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          rowsPerPage={rowsPerPage}
          onPageChange={(e, p) => onPageChange(p + 1)}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[10, 25, 50]}
          sx={{ borderTop: 1, borderColor: 'divider' }}
        />
      )}
    </Paper>
  );
}
