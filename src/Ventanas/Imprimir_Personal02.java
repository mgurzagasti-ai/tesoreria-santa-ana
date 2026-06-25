/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Ventanas;

import com.placeholder.PlaceHolder;
import com.sun.glass.events.KeyEvent;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.JLabel;
import javax.swing.SwingConstants;
import javax.swing.table.DefaultTableModel;
import javax.swing.table.TableModel;
import javax.swing.table.TableRowSorter;
import java.awt.*;
import java.awt.print.*;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.text.SimpleDateFormat;
import java.util.Date;
import javax.swing.JOptionPane;
import javax.swing.table.DefaultTableCellRenderer;

/**
 *
 * @author tesoreria
 */
public class Imprimir_Personal02 extends javax.swing.JFrame implements Printable{
    
    //CONEXION A LA BASE DE DATOS
    Conectar cc= new Conectar();
    Connection cn= cc.conexion();
    public static Date fechainicio,fechafin;
    

    /**
     * Creates new form Padron_de_Empleados
     */
    public Imprimir_Personal02() {
        initComponents();
        this.setLocationRelativeTo(this);  //CENTRAR VENTANA
        //CAMBIAR FORMATO DEL JDATECHOOSER
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        SimpleDateFormat sdf1 = new SimpleDateFormat("dd/MM/yyyy");
        jLabel9.setText(sdf1.format(Interfaz.Fecha_Inicial));
        jLabel10.setText(sdf1.format(Interfaz.Fecha_Final));
        jLabel5.setText(Interfaz.Leg);
        jLabel11.setText(Interfaz.Apellido+", "+Interfaz.Nombre);
        
        //PARA PONER DOS DIGITOS A LOS DECIMALES
        DecimalFormatSymbols separadoresPersonalizados = new DecimalFormatSymbols();
        separadoresPersonalizados.setDecimalSeparator('.');
        DecimalFormat formato1 = new DecimalFormat("###,###.##");
        double bandera1=0.0;
        int bandera2=0;
        double saldo=0.0;
        DefaultTableModel modelo = new DefaultTableModel();
        //PODER ORDENAR DE MAYOR A MENOR O VICEVERSA
        TableRowSorter<TableModel> elQueOrdena = new TableRowSorter<>(modelo);
        jTableBD.setRowSorter(elQueOrdena);
        //FIN
        modelo.addColumn("COD");
        modelo.addColumn("FECHA");
        modelo.addColumn("CONCEPTO");
        modelo.addColumn("N° VALE");
        modelo.addColumn("MES");
        modelo.addColumn("AÑO");
        modelo.addColumn("IMPORTE (-)");
        modelo.addColumn("IMPORTE (+)");
        modelo.addColumn("SALDO");
        jTableBD.setModel(modelo);
        //INICIO - PONER TAMAÑO DE LAS COLUMNAS
        jTableBD.getColumn("COD").setPreferredWidth(01);
        jTableBD.getColumn("FECHA").setPreferredWidth(80);
        jTableBD.getColumn("CONCEPTO").setPreferredWidth(240);
        jTableBD.getColumn("N° VALE").setPreferredWidth(80);
        jTableBD.getColumn("MES").setPreferredWidth(70);
        jTableBD.getColumn("AÑO").setPreferredWidth(70);
        jTableBD.getColumn("IMPORTE (-)").setPreferredWidth(75);
        jTableBD.getColumn("IMPORTE (+)").setPreferredWidth(75);
        jTableBD.getColumn("SALDO").setPreferredWidth(90);
        //FIN - PONER TAMAÑO DE LAS COLUMNAS
        //INICIO - ALINEAR LAS COLUMNAS A LA DERECHA
        DefaultTableCellRenderer tcr = new DefaultTableCellRenderer();
        tcr.setHorizontalAlignment(SwingConstants.RIGHT);
        jTableBD.getColumnModel().getColumn(8).setCellRenderer(tcr);
        //FIN - ALINEAR LAS COLUMNAS A LA DERECHA
        //INICIO - ALINEAR LAS COLUMNAS AL CENTRO
        DefaultTableCellRenderer tcr1 = new DefaultTableCellRenderer();
        tcr1.setHorizontalAlignment(SwingConstants.CENTER);
        jTableBD.getColumnModel().getColumn(6).setCellRenderer(tcr1);
        jTableBD.getColumnModel().getColumn(7).setCellRenderer(tcr1);
        //FIN - ALINEAR LAS COLUMNAS AL CENTRO
        //BUSCAR DATOS EN TABLA COMPLETA
        String sql = "SELECT * FROM `saldos` WHERE `Leg` LIKE '%"+Interfaz.Leg+"%' ORDER BY `Fecha` ASC";
        String datos[] = new String [9];
        String bandera3[] = new String [9];
        Statement st;
        try{
            st= cn.createStatement();
            ResultSet rs = st.executeQuery(sql);
            while (rs.next()){
                bandera1= saldo;
                datos[0]=rs.getString(1);
                datos[1]=rs.getString(3);
                datos[2]=rs.getString(4);
                datos[3]=rs.getString(5);
                datos[4]=rs.getString(6);
                datos[5]=rs.getString(7);
                datos[6]=rs.getString(8);
                datos[7]=rs.getString(9);
                if (rs.getString(8).equals("0")){
                    saldo= saldo+Double.parseDouble(rs.getString(9));
                } else{
                    saldo= saldo+Double.parseDouble(rs.getString(8));
                }
                datos[8]="$ "+String.format("%.2f",saldo).replace(',', '.');
                //modelo.addRow(datos);
                // Comparo las fechas y despliego el resultado
                switch (Interfaz.Fecha_Inicial.compareTo(rs.getDate(3))){
                    case 0:
                        switch (Interfaz.Fecha_Final.compareTo(rs.getDate(3))){
                            case 1:
                                bandera2=bandera2+1;
                                if (bandera2==1){
                                    bandera3[2]="SALDO ANTERIOR";
                                    bandera3[8]="$ "+String.format("%.2f",bandera1).replace(',', '.');
                                    modelo.addRow(bandera3);
                                }
                                modelo.addRow(datos);
                                break;
                            case 0:
                                bandera2=bandera2+1;
                                if (bandera2==1){
                                    bandera3[2]="SALDO ANTERIOR";
                                    bandera3[8]="$ "+String.format("%.2f",bandera1).replace(',', '.');
                                    modelo.addRow(bandera3);
                                }
                                modelo.addRow(datos);
                                break;
                        }
                        break;
                    case -1:
                        switch (Interfaz.Fecha_Final.compareTo(rs.getDate(3))){
                            case 1:
                                bandera2=bandera2+1;
                                if (bandera2==1){
                                    bandera3[2]="SALDO ANTERIOR";
                                    bandera3[8]="$ "+String.format("%.2f",bandera1).replace(',', '.');
                                    modelo.addRow(bandera3);
                                }
                                modelo.addRow(datos);
                                break;
                            case 0:
                                bandera2=bandera2+1;
                                if (bandera2==1){
                                    bandera3[2]="SALDO ANTERIOR";
                                    bandera3[8]="$ "+String.format("%.2f",bandera1).replace(',', '.');
                                    modelo.addRow(bandera3);
                                }
                                modelo.addRow(datos);
                                break;
                        }
                        break;
                }
            }
            jTableBD.setModel(modelo);
        }catch (SQLException ex){
            Logger.getLogger(Padron_de_Empleados.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    void MostrarSaldo(String DATOS){
        //PARA PONER DOS DIGITOS A LOS DECIMALES
        DecimalFormatSymbols separadoresPersonalizados = new DecimalFormatSymbols();
        separadoresPersonalizados.setDecimalSeparator('.');
        DecimalFormat formato1 = new DecimalFormat("###,###.##");
        double bandera1=0.0;
        int bandera2=0;
        double saldo=0.0;
        DefaultTableModel modelo = new DefaultTableModel();
        //PODER ORDENAR DE MAYOR A MENOR O VICEVERSA
        TableRowSorter<TableModel> elQueOrdena = new TableRowSorter<>(modelo);
        jTableBD.setRowSorter(elQueOrdena);
        //FIN
        //CAMBIAR FORMATO DEL JDATECHOOSER PARA SUBIR AL SQL
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        SimpleDateFormat sdf1 = new SimpleDateFormat("dd/MM/yyyy");

        modelo.addColumn("COD");
        modelo.addColumn("FECHA");
        modelo.addColumn("CONCEPTO");
        modelo.addColumn("N° VALE");
        modelo.addColumn("MES");
        modelo.addColumn("AÑO");
        modelo.addColumn("IMPORTE (-)");
        modelo.addColumn("IMPORTE (+)");
        modelo.addColumn("SALDO");
        jTableBD.setModel(modelo);
        
        //PONER TAMAÑO DE LAS COLUMNAS
        jTableBD.getColumn("COD").setPreferredWidth(01);
        jTableBD.getColumn("FECHA").setPreferredWidth(90);
        jTableBD.getColumn("CONCEPTO").setPreferredWidth(200);
        jTableBD.getColumn("N° VALE").setPreferredWidth(90);
        jTableBD.getColumn("MES").setPreferredWidth(70);
        jTableBD.getColumn("AÑO").setPreferredWidth(70);
        jTableBD.getColumn("IMPORTE (-)").setPreferredWidth(75);
        jTableBD.getColumn("IMPORTE (+)").setPreferredWidth(75);
        jTableBD.getColumn("SALDO").setPreferredWidth(90);
        
        //ALINEAR LAS COLUMNAS A LA DERECHA
        DefaultTableCellRenderer tcr = new DefaultTableCellRenderer();
        tcr.setHorizontalAlignment(SwingConstants.RIGHT);
        jTableBD.getColumnModel().getColumn(8).setCellRenderer(tcr);
        
        //ALINEAR LAS COLUMNAS AL CENTRO
        DefaultTableCellRenderer tcr1 = new DefaultTableCellRenderer();
        tcr1.setHorizontalAlignment(SwingConstants.CENTER);
        jTableBD.getColumnModel().getColumn(6).setCellRenderer(tcr1);
        jTableBD.getColumnModel().getColumn(7).setCellRenderer(tcr1);
        
        //BUSCAR DATOS EN TABLA COMPLETA
            String sql = "SELECT * FROM `saldos` WHERE `Leg` LIKE '%"+DATOS+"%' ORDER BY `Fecha` ASC";
            String datos[] = new String [9];
            String bandera3[] = new String [9];
            Statement st;
            
            try{
                st= cn.createStatement();
                ResultSet rs = st.executeQuery(sql);
                while (rs.next()){
                    bandera1= saldo;
                    datos[0]=rs.getString(1);
                    datos[1]=rs.getString(3);
                    datos[2]=rs.getString(4);
                    datos[3]=rs.getString(5);
                    datos[4]=rs.getString(6);
                    datos[5]=rs.getString(7);
                    datos[6]=rs.getString(8);
                    datos[7]=rs.getString(9);
                    if (rs.getString(8).equals("0")){
                        saldo= saldo+Double.parseDouble(rs.getString(9));
                    } else{
                        saldo= saldo+Double.parseDouble(rs.getString(8));
                    }
                    datos[8]="$ "+String.format("%.2f",saldo).replace(',', '.');
                    //modelo.addRow(datos);
                    
                    
                    // Comparo las fechas y despliego el resultado
                    switch (Interfaz.Fecha_Inicial.compareTo(rs.getDate(3))){
                        case 0:
                            switch (Interfaz.Fecha_Final.compareTo(rs.getDate(3))){
                                case 1:
                                    bandera2=bandera2+1;
                                    if (bandera2==1){
                                        bandera3[2]="SALDO ANTERIOR";
                                        bandera3[8]="$ "+String.format("%.2f",bandera1).replace(',', '.');
                                        modelo.addRow(bandera3);
                                        }
                                    modelo.addRow(datos);
                                    break;
                                case 0:
                                    bandera2=bandera2+1;
                                    if (bandera2==1){
                                        bandera3[2]="SALDO ANTERIOR";
                                        bandera3[8]="$ "+String.format("%.2f",bandera1).replace(',', '.');
                                        modelo.addRow(bandera3);
                                        }
                                    modelo.addRow(datos);
                                    break;
                                }
                            break;
                        case -1:
                            switch (Interfaz.Fecha_Final.compareTo(rs.getDate(3))){
                                case 1:
                                    bandera2=bandera2+1;
                                    if (bandera2==1){
                                        bandera3[2]="SALDO ANTERIOR";
                                        bandera3[8]="$ "+String.format("%.2f",bandera1).replace(',', '.');
                                        modelo.addRow(bandera3);
                                        }
                                    modelo.addRow(datos);
                                    break;
                                case 0:
                                    bandera2=bandera2+1;
                                    if (bandera2==1){
                                        bandera3[2]="SALDO ANTERIOR";
                                        bandera3[8]="$ "+String.format("%.2f",bandera1).replace(',', '.');
                                        modelo.addRow(bandera3);
                                        }
                                    modelo.addRow(datos);
                                    break;
                                }
                            break;
                            }
                    
                    
                    }
                jTableBD.setModel(modelo);
                }catch (SQLException ex){
                    Logger.getLogger(Imprimir_Personal02.class.getName()).log(Level.SEVERE, null, ex);
                    }
    }

    /**
     * This method is called from within the constructor to initialize the form.
     * WARNING: Do NOT modify this code. The content of this method is always
     * regenerated by the Form Editor.
     */
    @SuppressWarnings("unchecked")
    // <editor-fold defaultstate="collapsed" desc="Generated Code">//GEN-BEGIN:initComponents
    private void initComponents() {

        jButton1 = new javax.swing.JButton();
        jLabel2 = new javax.swing.JLabel();
        jLabel1 = new javax.swing.JLabel();
        jPanel1 = new javax.swing.JPanel();
        jLabel3 = new javax.swing.JLabel();
        jLabel6 = new javax.swing.JLabel();
        jLabel7 = new javax.swing.JLabel();
        jLabel8 = new javax.swing.JLabel();
        jLabel9 = new javax.swing.JLabel();
        jLabel10 = new javax.swing.JLabel();
        jLabel5 = new javax.swing.JLabel();
        jScrollPane1 = new javax.swing.JScrollPane();
        jTableBD = new javax.swing.JTable();
        jLabel11 = new javax.swing.JLabel();
        jButton2 = new javax.swing.JButton();
        jButton3 = new javax.swing.JButton();
        jButton4 = new javax.swing.JButton();
        jButton5 = new javax.swing.JButton();
        jButton6 = new javax.swing.JButton();

        setDefaultCloseOperation(javax.swing.WindowConstants.EXIT_ON_CLOSE);
        setBackground(new java.awt.Color(255, 255, 255));
        setMaximumSize(new java.awt.Dimension(816, 750));
        setMinimumSize(new java.awt.Dimension(816, 750));
        setPreferredSize(new java.awt.Dimension(816, 750));

        jButton1.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Imagenes/boton_volver_50x50.png"))); // NOI18N
        jButton1.setToolTipText("VOLVER AL MENU PRINCIPAL");
        jButton1.setMaximumSize(new java.awt.Dimension(60, 60));
        jButton1.setMinimumSize(new java.awt.Dimension(60, 60));
        jButton1.setPreferredSize(new java.awt.Dimension(60, 60));
        jButton1.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jButton1ActionPerformed(evt);
            }
        });

        jLabel2.setFont(new java.awt.Font("Tahoma", 1, 36)); // NOI18N
        jLabel2.setHorizontalAlignment(javax.swing.SwingConstants.LEFT);
        jLabel2.setText("IMPRIMIR SALDOS AL PERSONAL");
        jLabel2.setMaximumSize(new java.awt.Dimension(700, 60));
        jLabel2.setMinimumSize(new java.awt.Dimension(700, 60));
        jLabel2.setPreferredSize(new java.awt.Dimension(700, 60));

        jLabel1.setFont(new java.awt.Font("Tahoma", 0, 36)); // NOI18N
        jLabel1.setHorizontalAlignment(javax.swing.SwingConstants.RIGHT);
        jLabel1.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Imagenes/franja azul.png"))); // NOI18N
        jLabel1.setMaximumSize(new java.awt.Dimension(600, 60));
        jLabel1.setMinimumSize(new java.awt.Dimension(600, 60));
        jLabel1.setPreferredSize(new java.awt.Dimension(600, 60));

        jPanel1.setBackground(new java.awt.Color(255, 255, 255));
        jPanel1.setBorder(javax.swing.BorderFactory.createLineBorder(new java.awt.Color(0, 0, 0), 2));
        jPanel1.setMaximumSize(new java.awt.Dimension(800, 550));
        jPanel1.setMinimumSize(new java.awt.Dimension(800, 550));
        jPanel1.setPreferredSize(new java.awt.Dimension(800, 550));

        jLabel3.setFont(new java.awt.Font("Tahoma", 1, 18)); // NOI18N
        jLabel3.setHorizontalAlignment(javax.swing.SwingConstants.CENTER);
        jLabel3.setText("SANTA ANA S.R.L.");
        jLabel3.setBorder(new javax.swing.border.LineBorder(new java.awt.Color(0, 0, 0), 1, true));

        jLabel6.setFont(new java.awt.Font("Tahoma", 1, 18)); // NOI18N
        jLabel6.setText("DETALLE DE MOVIMIENTOS Y SALDOS");

        jLabel7.setFont(new java.awt.Font("Tahoma", 1, 11)); // NOI18N
        jLabel7.setText("DESDE:");

        jLabel8.setFont(new java.awt.Font("Tahoma", 1, 11)); // NOI18N
        jLabel8.setText("HASTA:");

        jLabel9.setFont(new java.awt.Font("Tahoma", 1, 11)); // NOI18N
        jLabel9.setText("DD/MM/AAAA");

        jLabel10.setFont(new java.awt.Font("Tahoma", 1, 11)); // NOI18N
        jLabel10.setText("DD/MM/AAAA");

        jLabel5.setText("LEG");

        jTableBD.setFont(new java.awt.Font("Tahoma", 0, 13)); // NOI18N
        jScrollPane1.setViewportView(jTableBD);

        jLabel11.setText("APELLIDO Y NOMBRE");

        javax.swing.GroupLayout jPanel1Layout = new javax.swing.GroupLayout(jPanel1);
        jPanel1.setLayout(jPanel1Layout);
        jPanel1Layout.setHorizontalGroup(
            jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(jPanel1Layout.createSequentialGroup()
                .addContainerGap()
                .addGroup(jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.TRAILING)
                    .addGroup(jPanel1Layout.createSequentialGroup()
                        .addComponent(jLabel6, javax.swing.GroupLayout.PREFERRED_SIZE, 490, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addGap(143, 143, 143)
                        .addGroup(jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                            .addComponent(jLabel7)
                            .addComponent(jLabel8))
                        .addGap(18, 18, 18)
                        .addGroup(jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING, false)
                            .addComponent(jLabel10, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                            .addComponent(jLabel9)))
                    .addGroup(jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.TRAILING, false)
                        .addComponent(jLabel3, javax.swing.GroupLayout.Alignment.LEADING, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                        .addComponent(jScrollPane1, javax.swing.GroupLayout.Alignment.LEADING, javax.swing.GroupLayout.DEFAULT_SIZE, 772, Short.MAX_VALUE)))
                .addContainerGap(javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))
            .addGroup(jPanel1Layout.createSequentialGroup()
                .addGap(51, 51, 51)
                .addComponent(jLabel5, javax.swing.GroupLayout.PREFERRED_SIZE, 40, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.UNRELATED)
                .addComponent(jLabel11, javax.swing.GroupLayout.PREFERRED_SIZE, 248, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addGap(0, 0, Short.MAX_VALUE))
        );
        jPanel1Layout.setVerticalGroup(
            jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(jPanel1Layout.createSequentialGroup()
                .addContainerGap()
                .addGroup(jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.TRAILING)
                    .addGroup(jPanel1Layout.createSequentialGroup()
                        .addComponent(jLabel3, javax.swing.GroupLayout.PREFERRED_SIZE, 39, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                        .addComponent(jLabel6, javax.swing.GroupLayout.PREFERRED_SIZE, 46, javax.swing.GroupLayout.PREFERRED_SIZE))
                    .addGroup(jPanel1Layout.createSequentialGroup()
                        .addGroup(jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                            .addComponent(jLabel7)
                            .addComponent(jLabel9))
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                        .addGroup(jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                            .addComponent(jLabel8)
                            .addComponent(jLabel10))))
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addGroup(jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(jLabel5)
                    .addComponent(jLabel11))
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addComponent(jScrollPane1, javax.swing.GroupLayout.DEFAULT_SIZE, 668, Short.MAX_VALUE))
        );

        jButton2.setText("<-");
        jButton2.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jButton2ActionPerformed(evt);
            }
        });

        jButton3.setText("<");
        jButton3.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jButton3ActionPerformed(evt);
            }
        });

        jButton4.setText(">");
        jButton4.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jButton4ActionPerformed(evt);
            }
        });

        jButton5.setText("->");
        jButton5.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jButton5ActionPerformed(evt);
            }
        });

        jButton6.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Imagenes/boton_imprimir_30x30.png"))); // NOI18N
        jButton6.setMaximumSize(new java.awt.Dimension(30, 30));
        jButton6.setMinimumSize(new java.awt.Dimension(30, 30));
        jButton6.setPreferredSize(new java.awt.Dimension(30, 30));
        jButton6.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jButton6ActionPerformed(evt);
            }
        });

        javax.swing.GroupLayout layout = new javax.swing.GroupLayout(getContentPane());
        getContentPane().setLayout(layout);
        layout.setHorizontalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(layout.createSequentialGroup()
                .addComponent(jLabel1, javax.swing.GroupLayout.PREFERRED_SIZE, 600, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED, 140, Short.MAX_VALUE)
                .addComponent(jButton1, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE))
            .addComponent(jPanel1, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
            .addGroup(javax.swing.GroupLayout.Alignment.TRAILING, layout.createSequentialGroup()
                .addContainerGap(javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                .addComponent(jButton2)
                .addGap(18, 18, 18)
                .addComponent(jButton3)
                .addGap(55, 55, 55)
                .addComponent(jButton6, javax.swing.GroupLayout.PREFERRED_SIZE, 44, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addGap(48, 48, 48)
                .addComponent(jButton4)
                .addGap(18, 18, 18)
                .addComponent(jButton5)
                .addGap(217, 217, 217))
            .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                .addGroup(javax.swing.GroupLayout.Alignment.TRAILING, layout.createSequentialGroup()
                    .addGap(0, 100, Short.MAX_VALUE)
                    .addComponent(jLabel2, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)))
        );
        layout.setVerticalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(javax.swing.GroupLayout.Alignment.TRAILING, layout.createSequentialGroup()
                .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING, false)
                    .addComponent(jButton1, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                    .addComponent(jLabel1, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))
                .addGap(18, 18, 18)
                .addComponent(jPanel1, javax.swing.GroupLayout.DEFAULT_SIZE, 800, Short.MAX_VALUE)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addGroup(layout.createSequentialGroup()
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED, 13, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                            .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                                .addComponent(jButton4)
                                .addComponent(jButton5))
                            .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                                .addComponent(jButton2)
                                .addComponent(jButton3))))
                    .addComponent(jButton6, javax.swing.GroupLayout.PREFERRED_SIZE, 44, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addContainerGap())
            .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                .addGroup(layout.createSequentialGroup()
                    .addComponent(jLabel2, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addGap(0, 879, Short.MAX_VALUE)))
        );

        pack();
    }// </editor-fold>//GEN-END:initComponents

    private void jButton1ActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jButton1ActionPerformed
        // TODO add your handling code here:
        Consulta_de_Saldos consulta_de_saldos = new Consulta_de_Saldos();
        consulta_de_saldos.setVisible(true);
        this.setVisible(false);
    }//GEN-LAST:event_jButton1ActionPerformed

    private void jButton2ActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jButton2ActionPerformed
        // TODO add your handling code here:
        //--------INICIO BUSCAR LEGAJOS
        String sql2 = "SELECT * FROM `empleados` WHERE `Activo` LIKE '%S%' ORDER BY `empleados`.`Leg` ASC";
        
        Statement st2;
        
        try{
            st2= cn.createStatement();
            ResultSet rs2 = st2.executeQuery(sql2);
            rs2.first();
            jLabel5.setText(rs2.getString(2).trim());
            jLabel11.setText(rs2.getString(4).trim()+", "+rs2.getString(5).trim());
            
            }catch (SQLException ex){
                Logger.getLogger(Imprimir_Personal02.class.getName()).log(Level.SEVERE, null, ex);
                }
        //--------FIN BUSCAR LEGAJOS
        
        MostrarSaldo(jLabel5.getText().trim());
    }//GEN-LAST:event_jButton2ActionPerformed

    private void jButton5ActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jButton5ActionPerformed
        // TODO add your handling code here:
        //--------INICIO BUSCAR LEGAJOS
        String sql2 = "SELECT * FROM `empleados` WHERE `Activo` LIKE '%S%' ORDER BY `empleados`.`Leg` ASC";
        
        Statement st2;
        
        try{
            st2= cn.createStatement();
            ResultSet rs2 = st2.executeQuery(sql2);
            rs2.last();
            jLabel5.setText(rs2.getString(2).trim());
            jLabel11.setText(rs2.getString(4).trim()+", "+rs2.getString(5).trim());
            
            }catch (SQLException ex){
                Logger.getLogger(Imprimir_Personal02.class.getName()).log(Level.SEVERE, null, ex);
                }
        //--------FIN BUSCAR LEGAJOS
        
        MostrarSaldo(jLabel5.getText().trim());
    }//GEN-LAST:event_jButton5ActionPerformed

    private void jButton4ActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jButton4ActionPerformed
        // TODO add your handling code here:
        //--------INICIO BUSCAR LEGAJOS
        String sql2 = "SELECT * FROM `empleados` WHERE `Activo` LIKE '%S%' ORDER BY `empleados`.`Leg` ASC";
        
        Statement st2;
        
        try{
            st2= cn.createStatement();
            ResultSet rs2 = st2.executeQuery(sql2);
            while (rs2.next()){
                if (rs2.getString(2).trim().equals(jLabel5.getText().trim())){
                    rs2.next();
                    jLabel5.setText(rs2.getString(2).trim());
                    jLabel11.setText(rs2.getString(4).trim()+", "+rs2.getString(5).trim());
                    }
                }
            }catch (SQLException ex){
                Logger.getLogger(Padron_de_Empleados.class.getName()).log(Level.SEVERE, null, ex);
                }
        //--------FIN BUSCAR LEGAJOS
        
        MostrarSaldo(jLabel5.getText().trim());
    }//GEN-LAST:event_jButton4ActionPerformed

    private void jButton3ActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jButton3ActionPerformed
        // TODO add your handling code here:
        //--------INICIO BUSCAR LEGAJOS
        String sql2 = "SELECT * FROM `empleados` WHERE `Activo` LIKE '%S%' ORDER BY `empleados`.`Leg` ASC";
        
        Statement st2;
        
        try{
            st2= cn.createStatement();
            ResultSet rs2 = st2.executeQuery(sql2);
            while (rs2.next()){
                if (rs2.getString(2).trim().equals(jLabel5.getText().trim())){
                    rs2.previous();
                    jLabel5.setText(rs2.getString(2).trim());
                    jLabel11.setText(rs2.getString(4).trim()+", "+rs2.getString(5).trim());
                    }
                }
            }catch (SQLException ex){
                Logger.getLogger(Padron_de_Empleados.class.getName()).log(Level.SEVERE, null, ex);
                }
        //--------FIN BUSCAR LEGAJOS
        
        MostrarSaldo(jLabel5.getText().trim());
    }//GEN-LAST:event_jButton3ActionPerformed

    private void jButton6ActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jButton6ActionPerformed
        // TODO add your handling code here:
        //MANDAR A IMPRIMIR
                    try {
                        PrinterJob job = PrinterJob.getPrinterJob();
                        job.setPrintable(this);
                        job.printDialog();
                        job.print();
                        } catch (PrinterException ex) {
                            Logger.getLogger(Imprimir_Personal_Prueba.class.getName()).log(Level.SEVERE, null, ex);
                            }
    }//GEN-LAST:event_jButton6ActionPerformed

    /**
     * @param args the command line arguments
     */
    public static void main(String args[]) {
        /* Set the Nimbus look and feel */
        //<editor-fold defaultstate="collapsed" desc=" Look and feel setting code (optional) ">
        /* If Nimbus (introduced in Java SE 6) is not available, stay with the default look and feel.
         * For details see http://download.oracle.com/javase/tutorial/uiswing/lookandfeel/plaf.html 
         */
        try {
            for (javax.swing.UIManager.LookAndFeelInfo info : javax.swing.UIManager.getInstalledLookAndFeels()) {
                if ("Nimbus".equals(info.getName())) {
                    javax.swing.UIManager.setLookAndFeel(info.getClassName());
                    break;
                }
            }
        } catch (ClassNotFoundException ex) {
            java.util.logging.Logger.getLogger(Imprimir_Personal02.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (InstantiationException ex) {
            java.util.logging.Logger.getLogger(Imprimir_Personal02.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (IllegalAccessException ex) {
            java.util.logging.Logger.getLogger(Imprimir_Personal02.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (javax.swing.UnsupportedLookAndFeelException ex) {
            java.util.logging.Logger.getLogger(Imprimir_Personal02.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        }
        //</editor-fold>
        //</editor-fold>
        //</editor-fold>
        //</editor-fold>

        /* Create and display the form */
        java.awt.EventQueue.invokeLater(new Runnable() {
            public void run() {
                new Imprimir_Personal02().setVisible(true);
            }
        });
    }

    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JButton jButton1;
    public static javax.swing.JButton jButton2;
    public static javax.swing.JButton jButton3;
    public static javax.swing.JButton jButton4;
    public static javax.swing.JButton jButton5;
    private javax.swing.JButton jButton6;
    private javax.swing.JLabel jLabel1;
    public static javax.swing.JLabel jLabel10;
    public static javax.swing.JLabel jLabel11;
    private javax.swing.JLabel jLabel2;
    private javax.swing.JLabel jLabel3;
    public static javax.swing.JLabel jLabel5;
    private javax.swing.JLabel jLabel6;
    private javax.swing.JLabel jLabel7;
    private javax.swing.JLabel jLabel8;
    public static javax.swing.JLabel jLabel9;
    private javax.swing.JPanel jPanel1;
    private javax.swing.JScrollPane jScrollPane1;
    public static javax.swing.JTable jTableBD;
    // End of variables declaration//GEN-END:variables

    @Override
    public int print(Graphics g, PageFormat pf, int page) throws PrinterException {
        if (page>0){
            return NO_SUCH_PAGE;
        }
        
        Graphics2D g2d = (Graphics2D) g;
        g2d.translate(pf.getImageableX()+40, pf.getImageableY()+10);
        g2d.scale(0.58, 0.58);
        
        //QUE ES LO QUE QUIERO IMPRIMIR
        jPanel1.printAll(g);
        return PAGE_EXISTS;
    }
}
