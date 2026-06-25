/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Modelo;
import java.io.*;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.*;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.hssf.usermodel.*;
import org.apache.poi.xssf.usermodel.*;

/**
 *
 * @author tesoreria
 */
public class ModeloExcel {
    Workbook wb;
    
    public String Importar (File archivo, JTable tablaD){
        String respuesta="No se puede realizar la importacion. ";
        
        DefaultTableModel modeloT =new DefaultTableModel();
        tablaD.setModel(modeloT);
        try {
            wb = WorkbookFactory.create(new FileInputStream(archivo));
            Sheet hoja =wb.getSheetAt(0);
            Iterator filaIterator = hoja.rowIterator();
            int indiceFila = -1;
            while (filaIterator.hasNext()){
                indiceFila++;
                Row fila = (Row) filaIterator.next();
                Iterator columnaIterator = fila.cellIterator();
                Object [] listaColumna = new Object [3];
                int indiceColumna = -1;
                while (columnaIterator.hasNext()){
                    indiceColumna++;
                    Cell celda = (Cell) columnaIterator.next();
                    if (indiceFila==0){
                        modeloT.addColumn(celda.getStringCellValue());
                    }else{
                        if(celda!=null){
                            switch(celda.getCellType()){
                                case Cell.CELL_TYPE_NUMERIC:
                                    if (indiceColumna == 0) {
                                        //para que la primer columna sea unicamente enteros
                                        listaColumna[indiceColumna]=(int)(celda.getNumericCellValue());
                                    }
                                    if (indiceColumna == 2) {
                                        //Para que la tercer columna transforme los num en decimales con dos digitos
                                        DecimalFormatSymbols separadoresPersonalizados = new DecimalFormatSymbols();
                                        separadoresPersonalizados.setDecimalSeparator('.');
                                        DecimalFormat formato1 = new DecimalFormat("0.00", separadoresPersonalizados);
                                        listaColumna[indiceColumna]=formato1.format((celda.getNumericCellValue()));
                                    }
                                    break;
                                case Cell.CELL_TYPE_STRING:
                                    listaColumna[indiceColumna]=celda.getStringCellValue();
                                    break;
                                case Cell.CELL_TYPE_BOOLEAN:
                                    listaColumna[indiceColumna]=celda.getBooleanCellValue();
                                    break;
                                default:
                                    listaColumna[indiceColumna]=celda.getDateCellValue();
                                    break;
                            }
                        }
                    }
                }
                if (indiceFila!=0) modeloT.addRow(listaColumna);
            }
            respuesta = "Importacion Exitosa";
        }catch (Exception e){
        }
        
        return respuesta;
    }
    public String Exportar (File archivo, JTable tablaD){
        String respuesta = "No se realizo con exito la Exportacion";
        int numFila = tablaD.getRowCount(), numColumna = tablaD.getColumnCount();
        if (archivo.getName().endsWith("xls")){
            wb = new HSSFWorkbook();
        }else{
            wb = new XSSFWorkbook();
        }
        Sheet hoja = wb.createSheet("Pruebita");
        try{
            for (int i=-1; i<numFila; i++){
                Row fila = hoja.createRow(i+1);
                for (int j=-1; j<numColumna; j++){
                    Cell celda = fila.createCell(i);
                    if (i==-1){
                        celda.setCellValue(String.valueOf(tablaD.getColumnName(j)));
                    }else{
                        celda.setCellValue(String.valueOf(tablaD.getValueAt(i, j)));
                    }
                    wb.write(new FileOutputStream(archivo));
                }
            }
            respuesta="Exportacion exitosa";
        }catch (Exception e){
            
        }
        return respuesta;
    }
}