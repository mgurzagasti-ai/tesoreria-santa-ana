/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Controlador;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.*;
import Ventanas.Cancelacion_de_Haberes;
import Modelo.ModeloExcel;
import javax.swing.*;
import javax.swing.filechooser.FileNameExtensionFilter;

/**
 *
 * @author tesoreria
 */
public class ControladorExcelCdH implements ActionListener{
    ModeloExcel modeloE = new ModeloExcel();
    Cancelacion_de_Haberes vistaE = new Cancelacion_de_Haberes();
    JFileChooser selecArchivo = new JFileChooser();
    File archivo;
    int contAccion=0;
    
    public ControladorExcelCdH (Cancelacion_de_Haberes vistaE, ModeloExcel modeloE){
        this.vistaE= vistaE;
        this.modeloE= modeloE;
        this.vistaE.jButtonImportar.addActionListener(this);
        //this.vistaE.jButtonExportar.addActionListener(this);
    }
    
    public void AgregarFiltro (){
        selecArchivo.setFileFilter(new FileNameExtensionFilter("Excel (*.xls)","xls"));
        selecArchivo.setFileFilter(new FileNameExtensionFilter("Excel (*.xlsx)","xlsx"));
    }
    
    @Override
    public void actionPerformed(ActionEvent e) {
        contAccion++;
        if (contAccion==1)AgregarFiltro();
        
        if (e.getSource() == vistaE.jButtonImportar){
            if (selecArchivo.showDialog(null,"seleccionar archivo") == JFileChooser.APPROVE_OPTION){
                archivo = selecArchivo.getSelectedFile();
                if (archivo.getName().endsWith("xls") || archivo.getName().endsWith("xlsx")){
                    JOptionPane.showMessageDialog(null, modeloE.Importar(archivo, vistaE.jTableDatos));
                }else{
                    JOptionPane.showMessageDialog(null, "Elija un formato valido");
                }
            }
        }
        
       /* if (e.getSource() == vistaE.jButtonExportar){
            if (selecArchivo.showDialog(null,"Exportar") == JFileChooser.APPROVE_OPTION){
                archivo = selecArchivo.getSelectedFile();
                if (archivo.getName().endsWith("xls") || archivo.getName().endsWith("xlsx")){
                    JOptionPane.showMessageDialog(null, modeloE.Exportar(archivo, vistaE.jTableDatos));
                }else{
                    JOptionPane.showMessageDialog(null, "Elija un formato valido");
                }
            }
        }*/
    }
    
}
