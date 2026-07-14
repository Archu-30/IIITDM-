import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  Typography,
  Divider
} from '@mui/material';

const CustomTable = ({
  headers,
  data = [],
  emptyMessage = "No records found.",
  rowsPerPageOptions = [5, 10, 25],
  defaultRowsPerPage = 5,
  actionsHeader = false
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table sx={{ minWidth: 650 }} aria-label="custom table">
        <TableHead sx={{ bgcolor: '#F8FAFC' }}>
          <TableRow>
            {headers.map((header) => (
              <TableCell
                key={header.id}
                align={header.align || 'left'}
                sx={{
                  fontWeight: 600,
                  color: 'text.secondary',
                  py: 1.5,
                  borderBottom: '2px solid #E2E8F0',
                }}
              >
                {header.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={headers.length} align="center" sx={{ py: 6 }}>
                <Typography variant="body1" color="text.secondary">
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((row, index) => (
              <TableRow
                key={row.id || index}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover': { bgcolor: '#F8FAFC' },
                  transition: 'background-color 0.15s ease',
                }}
              >
                {headers.map((header) => {
                  const cellValue = row[header.id];
                  return (
                    <TableCell key={header.id} align={header.align || 'left'} sx={{ py: 1.8 }}>
                      {header.render ? header.render(row) : cellValue}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {data.length > 0 && (
        <>
          <Divider />
          <TablePagination
            rowsPerPageOptions={rowsPerPageOptions}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              bgcolor: '#FFFFFF',
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
            }}
          />
        </>
      )}
    </TableContainer>
  );
};

export default CustomTable;
