/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Ventanas;

import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.print.PageFormat;
import java.awt.print.Printable;
import static java.awt.print.Printable.NO_SUCH_PAGE;
import static java.awt.print.Printable.PAGE_EXISTS;
import java.awt.print.PrinterException;
import java.awt.print.PrinterJob;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.SwingConstants;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.DefaultTableModel;
import javax.swing.table.TableModel;
import javax.swing.table.TableRowSorter;

/**
 *
 * @author tesoreria
 */
public class DDMYSvariosLEG extends javax.swing.JFrame implements Printable{
    //CONEXION A LA BASE DE DATOS
    Conectar cc= new Conectar();
    Connection cn= cc.conexion();

    /**
     * Creates new form DDMYS
     */
    public DDMYSvariosLEG() {/*
        initComponents();
        //CAMBIAR FORMATO DEL JDATECHOOSER
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        SimpleDateFormat sdf1 = new SimpleDateFormat("dd/MM/yyyy");
        jLabel9.setText(sdf1.format(Imprimir_Resumen.Fecha_Inicial));
        jLabel10.setText(sdf1.format(Imprimir_Resumen.Fecha_Final));
        jLabel5.setText(Imprimir_Resumen.Leg);
        jLabel11.setText(Imprimir_Resumen.Apellido+", "+Imprimir_Resumen.Nombre);
        
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
        jTableBD.getColumn("FECHA").setPreferredWidth(90);
        jTableBD.getColumn("CONCEPTO").setPreferredWidth(200);
        jTableBD.getColumn("N° VALE").setPreferredWidth(90);
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
        String sql = "SELECT * FROM `saldos` WHERE `Leg` LIKE '%"+Imprimir_Resumen.Leg+"%' ORDER BY `Fecha` ASC";
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
                if (rs.getString(8).equals("-")){
                    saldo= saldo+Double.parseDouble(rs.getString(9));
                } else{
                    saldo= saldo+Double.parseDouble(rs.getString(8));
                }
                datos[8]="$ "+String.format("%.2f",saldo).replace(',', '.');
                //modelo.addRow(datos);
                // Comparo las fechas y despliego el resultado
                switch (Imprimir_Resumen.Fecha_Inicial.compareTo(rs.getDate(3))){
                    case 0:
                        switch (Imprimir_Resumen.Fecha_Final.compareTo(rs.getDate(3))){
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
                        switch (Imprimir_Resumen.Fecha_Final.compareTo(rs.getDate(3))){
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
        }*/
    }

    /**
     * This method is called from within the constructor to initialize the form.
     * WARNING: Do NOT modify this code. The content of this method is always
     * regenerated by the Form Editor.
     */
    @SuppressWarnings("unchecked")
    // <editor-fold defaultstate="collapsed" desc="Generated Code">//GEN-BEGIN:initComponents
    private void initComponents() {

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

        setDefaultCloseOperation(javax.swing.WindowConstants.EXIT_ON_CLOSE);
        setPreferredSize(new java.awt.Dimension(816, 670));

        jPanel1.setBackground(new java.awt.Color(255, 255, 255));
        jPanel1.setBorder(javax.swing.BorderFactory.createLineBorder(new java.awt.Color(0, 0, 0), 2));

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
                .addGroup(jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addGroup(jPanel1Layout.createSequentialGroup()
                        .addComponent(jLabel6, javax.swing.GroupLayout.PREFERRED_SIZE, 490, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED, 113, Short.MAX_VALUE)
                        .addGroup(jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                            .addComponent(jLabel7)
                            .addComponent(jLabel8))
                        .addGap(18, 18, 18)
                        .addGroup(jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING, false)
                            .addComponent(jLabel10, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                            .addComponent(jLabel9, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))
                        .addGap(40, 40, 40))
                    .addGroup(jPanel1Layout.createSequentialGroup()
                        .addGroup(jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.TRAILING, false)
                            .addComponent(jLabel3, javax.swing.GroupLayout.Alignment.LEADING, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                            .addComponent(jScrollPane1, javax.swing.GroupLayout.Alignment.LEADING, javax.swing.GroupLayout.DEFAULT_SIZE, 772, Short.MAX_VALUE))
                        .addContainerGap(javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))))
            .addGroup(jPanel1Layout.createSequentialGroup()
                .addGap(51, 51, 51)
                .addGroup(jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.TRAILING)
                    .addComponent(jLabel11, javax.swing.GroupLayout.PREFERRED_SIZE, 248, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(jLabel5, javax.swing.GroupLayout.PREFERRED_SIZE, 248, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addGap(0, 0, Short.MAX_VALUE))
        );
        jPanel1Layout.setVerticalGroup(
            jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(jPanel1Layout.createSequentialGroup()
                .addContainerGap()
                .addComponent(jLabel3, javax.swing.GroupLayout.PREFERRED_SIZE, 39, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addGroup(jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addComponent(jLabel6, javax.swing.GroupLayout.PREFERRED_SIZE, 46, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addGroup(jPanel1Layout.createSequentialGroup()
                        .addGap(12, 12, 12)
                        .addGroup(jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                            .addComponent(jLabel7)
                            .addComponent(jLabel9))
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                        .addGroup(jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                            .addComponent(jLabel8)
                            .addComponent(jLabel10))))
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addComponent(jLabel5)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addComponent(jLabel11)
                .addGap(5, 5, 5)
                .addComponent(jScrollPane1, javax.swing.GroupLayout.DEFAULT_SIZE, 497, Short.MAX_VALUE))
        );

        javax.swing.GroupLayout layout = new javax.swing.GroupLayout(getContentPane());
        getContentPane().setLayout(layout);
        layout.setHorizontalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 816, Short.MAX_VALUE)
            .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                .addGroup(layout.createSequentialGroup()
                    .addContainerGap()
                    .addComponent(jPanel1, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                    .addContainerGap()))
        );
        layout.setVerticalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 670, Short.MAX_VALUE)
            .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                .addGroup(layout.createSequentialGroup()
                    .addContainerGap()
                    .addComponent(jPanel1, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                    .addContainerGap()))
        );

        pack();
    }// </editor-fold>//GEN-END:initComponents

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
            java.util.logging.Logger.getLogger(DDMYSvariosLEG.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (InstantiationException ex) {
            java.util.logging.Logger.getLogger(DDMYSvariosLEG.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (IllegalAccessException ex) {
            java.util.logging.Logger.getLogger(DDMYSvariosLEG.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (javax.swing.UnsupportedLookAndFeelException ex) {
            java.util.logging.Logger.getLogger(DDMYSvariosLEG.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        }
        //</editor-fold>
        //</editor-fold>

        /* Create and display the form */
        java.awt.EventQueue.invokeLater(new Runnable() {
            public void run() {
                new DDMYSvariosLEG().setVisible(true);
            }
        });
    }

    // Variables declaration - do not modify//GEN-BEGIN:variables
    public static javax.swing.JLabel jLabel10;
    public static javax.swing.JLabel jLabel11;
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
        g2d.translate(pf.getImageableX(), pf.getImageableY());
        g2d.scale(0.5, 0.5);
        
        //QUE ES LO QUE QUIERO IMPRIMIR
        jPanel1.printAll(g);
        return PAGE_EXISTS;
    }
}
